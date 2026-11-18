"""Iceberg 3-D map shots (Visual-Venture style: dark map, satellite ground, glowing track, flat place labels).
usage: blender -b -P blender_map.py -- <case.json> <shot name> <out dir>
case.json: {origin:[lat,lon], imagery:[{file, extent:[xmin,ymin,xmax,ymax] (EPSG:3857 m), z}], states, counties,
            track:[[lat,lon]...], track_width_km, places:{name:[lat,lon]}, county_hi:[fips...],
            shots:{name:{frames, keys:[{f, cam:[lat,lon,alt_km], look:[lat,lon], ease}], track:[f0,f1,start,end],
                         labels:[[name,f_in]], counties:[f_in], line:[from,to,f0,f1], state_bevel:[[f,km]...]}}}
Everything is emissive (no lights) so the map grades the same in every shot. 1 BU = 1 km of web-mercator."""
import bpy, bmesh, json, math, sys, os
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:]
C = json.load(open(argv[0])); SHOT = C["shots"][argv[1]]; OUT = argv[2]
BASE = os.path.dirname(os.path.abspath(argv[0]))
R = 6378137.0
def merc(lat, lon): return R * math.radians(lon), R * math.log(math.tan(math.pi / 4 + math.radians(lat) / 2))
OX, OY = merc(*C["origin"])
def P(lat, lon, z=0.0): x, y = merc(lat, lon); return Vector(((x - OX) / 1000, (y - OY) / 1000, z))

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.engine = "BLENDER_EEVEE_NEXT" if "BLENDER_EEVEE_NEXT" in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items] else "BLENDER_EEVEE"
sc.render.resolution_x, sc.render.resolution_y = 1920, 1080
sc.render.fps = 30
sc.view_settings.view_transform = "Standard"
sc.world = bpy.data.worlds.new("w"); sc.world.color = (0.008, 0.01, 0.014)
sc.world.use_nodes = True; sc.world.node_tree.nodes["Background"].inputs[0].default_value = (0.008, 0.01, 0.014, 1)

def emit_mat(name, rgba, strength=1.0, alpha=None):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    o = nt.nodes.new("ShaderNodeOutputMaterial"); e = nt.nodes.new("ShaderNodeEmission")
    e.inputs[0].default_value = rgba; e.inputs[1].default_value = strength
    if alpha is None: nt.links.new(e.outputs[0], o.inputs[0])
    else:
        t = nt.nodes.new("ShaderNodeBsdfTransparent"); mx = nt.nodes.new("ShaderNodeMixShader"); mx.inputs[0].default_value = alpha
        nt.links.new(t.outputs[0], mx.inputs[1]); nt.links.new(e.outputs[0], mx.inputs[2]); nt.links.new(mx.outputs[0], o.inputs[0])
        m.blend_method = "BLEND" if hasattr(m, "blend_method") else None
    return m

# dark ground
bpy.ops.mesh.primitive_plane_add(size=20000, location=(0, 0, -0.6)); bpy.context.object.data.materials.append(emit_mat("ground", (0.018, 0.022, 0.03, 1)))

# satellite imagery planes (graded darker/desaturated, soft edges)
for im in C["imagery"]:
    xmin, ymin, xmax, ymax = im["extent"]
    cx, cy = ((xmin + xmax) / 2 - OX) / 1000, ((ymin + ymax) / 2 - OY) / 1000
    bpy.ops.mesh.primitive_plane_add(size=1, location=(cx, cy, im.get("z", 0)))
    ob = bpy.context.object; ob.scale = ((xmax - xmin) / 1000, (ymax - ymin) / 1000, 1)
    m = bpy.data.materials.new(im["file"]); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial"); tx = nt.nodes.new("ShaderNodeTexImage"); tx.image = bpy.data.images.load(os.path.join(BASE, im["file"]))
    hsv = nt.nodes.new("ShaderNodeHueSaturation"); hsv.inputs["Saturation"].default_value = im.get("sat", 0.75); hsv.inputs["Value"].default_value = im.get("val", 0.62)
    em = nt.nodes.new("ShaderNodeEmission"); tr = nt.nodes.new("ShaderNodeBsdfTransparent"); mx = nt.nodes.new("ShaderNodeMixShader")
    # soft edge mask from UV distance to the border
    uv = nt.nodes.new("ShaderNodeTexCoord"); sep = nt.nodes.new("ShaderNodeSeparateXYZ"); nt.links.new(uv.outputs["UV"], sep.inputs[0])
    def edge(sock):
        a = nt.nodes.new("ShaderNodeMath"); a.operation = "PINGPONG"; a.inputs[1].default_value = 0.5; nt.links.new(sock, a.inputs[0])
        b = nt.nodes.new("ShaderNodeMapRange"); b.inputs["From Max"].default_value = im.get("feather", 0.03); nt.links.new(a.outputs[0], b.inputs[0]); return b.outputs[0]
    mn = nt.nodes.new("ShaderNodeMath"); mn.operation = "MINIMUM"; nt.links.new(edge(sep.outputs[0]), mn.inputs[0]); nt.links.new(edge(sep.outputs[1]), mn.inputs[1])
    op = nt.nodes.new("ShaderNodeMath"); op.operation = "MULTIPLY"; op.inputs[1].default_value = 1.0; op.name = "opacity"; nt.links.new(mn.outputs[0], op.inputs[0])
    nt.links.new(tx.outputs[0], hsv.inputs["Color"]); nt.links.new(hsv.outputs[0], em.inputs[0])
    nt.links.new(op.outputs[0], mx.inputs[0]); nt.links.new(tr.outputs[0], mx.inputs[1]); nt.links.new(em.outputs[0], mx.inputs[2]); nt.links.new(mx.outputs[0], out.inputs[0])
    ob.data.materials.append(m)
    for f, v in SHOT.get("imagery_opacity", {}).get(im["file"], []):
        op.inputs[1].default_value = v; op.inputs[1].keyframe_insert("default_value", frame=f)

def poly_rings(geom):
    if geom["type"] == "Polygon": return geom["coordinates"]
    return [r for poly in geom["coordinates"] for r in poly]

def line_obj(name, rings, mat, bevel, z):
    cu = bpy.data.curves.new(name, "CURVE"); cu.dimensions = "3D"; cu.bevel_depth = bevel; cu.bevel_resolution = 0
    for ring in rings:
        sp = cu.splines.new("POLY"); sp.points.add(len(ring) - 1)
        for i, (lon, lat) in enumerate(ring): p = P(lat, lon, z); sp.points[i].co = (p.x, p.y, p.z, 1)
        sp.use_cyclic_u = True
    ob = bpy.data.objects.new(name, cu); bpy.context.collection.objects.link(ob); cu.materials.append(mat); return ob

def fill_obj(name, rings, mat, z):
    bm = bmesh.new()
    for ring in rings:
        vs = [bm.verts.new(P(lat, lon, z)) for lon, lat in ring[:-1]]
        if len(vs) > 2:
            try: bm.faces.new(vs)
            except ValueError: pass
    me = bpy.data.meshes.new(name); bm.to_mesh(me); ob = bpy.data.objects.new(name, me); bpy.context.collection.objects.link(ob); me.materials.append(mat); return ob

# US states: lines + highlighted state fill
if C.get("states"):
    gj = json.load(open(os.path.join(BASE, C["states"])))
    smat = emit_mat("stateline", (0.55, 0.62, 0.72, 1), 1.4)
    rings, hi = [], []
    for ft in gj["features"]:
        pr = ft["properties"]
        if pr.get("admin") != "United States of America" or pr.get("name") in ("Alaska", "Hawaii"): continue
        rr = poly_rings(ft["geometry"]); rings += rr
        if pr.get("name") == C.get("state_hi"): hi = rr
    st = line_obj("states", rings, smat, 1.0, 0.02)
    for f, km in SHOT.get("state_bevel", [[1, 1.0]]):
        st.data.bevel_depth = km; st.data.keyframe_insert("bevel_depth", frame=f)
    if hi:  # the highlighted state gets a brighter outline instead of a fill (a fill washes the imagery)
        h = line_obj("statehi", hi, emit_mat("statehi", (1, 0.85, 0.55, 1), 2.2), 1.0, 0.03)
        for f, km in SHOT.get("state_bevel", [[1, 1.0]]):
            h.data.bevel_depth = km * 1.6; h.data.keyframe_insert("bevel_depth", frame=f)

# counties (outline thin; highlighted county fill fades in)
if C.get("counties") and SHOT.get("counties"):
    gj = json.load(open(os.path.join(BASE, C["counties"])))
    cmat = emit_mat("countyline", (0.8, 0.82, 0.86, 1), 0.9)
    for ft in gj["features"]:
        fips = ft["id"]
        if fips[:2] != "17": continue
        rr = poly_rings(ft["geometry"])
        line_obj("c" + fips, rr, cmat, 0.07, 0.03)
        if fips in C.get("county_hi", []):
            m = emit_mat("chi" + fips, (1.0, 0.25, 0.18, 1), 1.0, alpha=0.0)
            ob = fill_obj("cf" + fips, rr, m, 0.025)
            mx = m.node_tree.nodes["Mix Shader"]
            f0 = SHOT["counties"][0]
            mx.inputs[0].default_value = 0; mx.inputs[0].keyframe_insert("default_value", frame=f0)
            mx.inputs[0].default_value = 0.07; mx.inputs[0].keyframe_insert("default_value", frame=f0 + 12)

# tornado track: flat glowing ribbon (path width), revealed along its length
if C.get("track") and SHOT.get("track"):
    f0, f1, s, e = SHOT["track"]
    cu = bpy.data.curves.new("track", "CURVE"); cu.dimensions = "3D"
    sp = cu.splines.new("POLY"); sp.points.add(len(C["track"]) - 1)
    for i, (lat, lon) in enumerate(C["track"]): p = P(lat, lon, 0.06); sp.points[i].co = (p.x, p.y, p.z, 1)
    cu.extrude = 0.0; cu.bevel_depth = 0
    w = C.get("track_width_km", 0.64)
    prof = bpy.data.curves.new("prof", "CURVE"); ps = prof.splines.new("POLY"); ps.points.add(1)
    ps.points[0].co = (-w / 2, 0, 0, 1); ps.points[1].co = (w / 2, 0, 0, 1)
    pob = bpy.data.objects.new("prof", prof); bpy.context.collection.objects.link(pob); pob.hide_render = True
    cu.bevel_mode = "OBJECT"; cu.bevel_object = pob; cu.use_fill_caps = False
    tob = bpy.data.objects.new("track", cu); bpy.context.collection.objects.link(tob)
    cu.materials.append(emit_mat("track", (1.0, 0.16, 0.1, 1), 3.0, alpha=0.82))
    cu.bevel_factor_mapping_end = "SPLINE"
    cu.bevel_factor_end = s; cu.keyframe_insert("bevel_factor_end", frame=f0)
    cu.bevel_factor_end = e; cu.keyframe_insert("bevel_factor_end", frame=f1)
    # a thin bright core line over the ribbon
    core = bpy.data.curves.new("core", "CURVE"); core.dimensions = "3D"; core.bevel_depth = SHOT.get("core_km", 0.08)
    sp2 = core.splines.new("POLY"); sp2.points.add(len(C["track"]) - 1)
    for i, (lat, lon) in enumerate(C["track"]): p = P(lat, lon, 0.08); sp2.points[i].co = (p.x, p.y, p.z, 1)
    cob = bpy.data.objects.new("core", core); bpy.context.collection.objects.link(cob); core.materials.append(emit_mat("core", (1.0, 0.75, 0.6, 1), 6.0))
    core.bevel_factor_mapping_end = "SPLINE"
    core.bevel_factor_end = s; core.keyframe_insert("bevel_factor_end", frame=f0)
    core.bevel_factor_end = e; core.keyframe_insert("bevel_factor_end", frame=f1)

# a dashed travel line between two places (e.g. Fairdale -> Genoa)
if SHOT.get("line"):
    a, b, f0, f1 = SHOT["line"]; pa, pb = P(*C["places"][a], 0.09), P(*C["places"][b], 0.09)
    cu = bpy.data.curves.new("line", "CURVE"); cu.dimensions = "3D"; cu.bevel_depth = SHOT.get("line_km", 0.07)
    n = 40; d = (pb - pa)
    for k in range(n):
        if k % 2: continue
        sp = cu.splines.new("POLY"); sp.points.add(1)
        q0, q1 = pa + d * (k / n), pa + d * ((k + 1) / n)
        sp.points[0].co = (*q0, 1); sp.points[1].co = (*q1, 1)
    ob = bpy.data.objects.new("line", cu); bpy.context.collection.objects.link(ob); cu.materials.append(emit_mat("line", (1, 1, 1, 1), 2.5))
    cu.bevel_factor_mapping_end = "SPLINE"
    ob.scale = (1, 1, 1)
    # reveal by animating visibility of dash splines is clumsy: grow with a shrinking mask (scale from start)
    ob.location = pa;
    for sp in cu.splines:
        for p in sp.points: p.co = (p.co[0] - pa.x, p.co[1] - pa.y, p.co[2] - pa.z, 1)
    ob.scale = (0.001, 0.001, 1); ob.keyframe_insert("scale", frame=f0)
    ob.scale = (1, 1, 1); ob.keyframe_insert("scale", frame=f1)

# place markers + flat labels
font = bpy.data.fonts.load(C["font"]) if C.get("font") else None
for name, f_in in SHOT.get("labels", []):
    lat, lon = C["places"][name]; p = P(lat, lon, 0.1)
    size = SHOT.get("label_km", 0.9)
    bpy.ops.mesh.primitive_circle_add(vertices=48, radius=size * 0.28, fill_type="NGON", location=p)
    dot = bpy.context.object; dot.data.materials.append(emit_mat("dot" + name, (1, 1, 1, 1), 4))
    bpy.ops.mesh.primitive_torus_add(major_radius=size * 0.55, minor_radius=size * 0.05, location=p)
    ring = bpy.context.object; ring.scale = (1, 1, 0.01); ring.data.materials.append(emit_mat("ring" + name, (1, 1, 1, 1), 2.5))
    cu = bpy.data.curves.new("t" + name, "FONT"); cu.body = name.upper(); cu.size = size; cu.space_character = 1.12
    if font: cu.font = font
    cu.align_y = "CENTER"
    tob = bpy.data.objects.new("t" + name, cu); bpy.context.collection.objects.link(tob)
    tob.location = p + Vector((size * 1.25, 0, 0.02)); cu.materials.append(emit_mat("txt" + name, (1, 1, 1, 1), 2.2))
    for ob in (dot, ring, tob):
        ob.scale = (0, 0, 0) if ob is not ring else (0, 0, 0.01); ob.keyframe_insert("scale", frame=f_in)
        ob.scale = (1, 1, 1) if ob is not ring else (1, 1, 0.01); ob.keyframe_insert("scale", frame=f_in + 8)
    # ring pulse
    ring.scale = (1, 1, 0.01); ring.keyframe_insert("scale", frame=f_in + 8)
    ring.scale = (1.0, 1.0, 0.01); ring.keyframe_insert("scale", frame=f_in + 30)

# camera keys: position from [lat, lon, alt km], aim at [lat, lon]
cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam")); bpy.context.collection.objects.link(cam); sc.camera = cam
cam.data.lens = SHOT.get("lens", 35); cam.data.clip_start = SHOT.get("clip", 0.4); cam.data.clip_end = 20000
tgt = bpy.data.objects.new("tgt", None); bpy.context.collection.objects.link(tgt)
c = cam.constraints.new("TRACK_TO"); c.target = tgt; c.track_axis = "TRACK_NEGATIVE_Z"; c.up_axis = "UP_Y"
for k in SHOT["keys"]:
    cam.location = P(k["cam"][0], k["cam"][1], k["cam"][2]); cam.keyframe_insert("location", frame=k["f"])
    tgt.location = P(k["look"][0], k["look"][1], 0); tgt.keyframe_insert("location", frame=k["f"])
for ob in (cam, tgt):
    for fc in ob.animation_data.action.fcurves if hasattr(ob.animation_data.action, "fcurves") else []:
        for kp in fc.keyframe_points: kp.interpolation = "BEZIER"; kp.easing = "AUTO"
# Blender 5 layered actions: set interpolation through the channelbag API when fcurves is not on the action
try:
    for ob in (cam, tgt):
        for layer in ob.animation_data.action.layers:
            for strip in layer.strips:
                for cb in strip.channelbags:
                    for fc in cb.fcurves:
                        for kp in fc.keyframe_points: kp.interpolation = "BEZIER"
except Exception: pass
sc.frame_start = 1; sc.frame_end = SHOT["frames"]

# glow in the compositor
try:
    sc.use_nodes = True
    nt = sc.node_tree; rl = nt.nodes.get("Render Layers"); comp = nt.nodes.get("Composite")
    gl = nt.nodes.new("CompositorNodeGlare"); gl.glare_type = "BLOOM" if "BLOOM" in [i.identifier for i in gl.bl_rna.properties["glare_type"].enum_items] else "FOG_GLOW"
    nt.links.new(rl.outputs[0], gl.inputs[0]); nt.links.new(gl.outputs[0], comp.inputs[0])
except Exception as ex: print("no glare:", ex)

exec(open("C:/Users/ayush/Videos/CLAUDE/STYLE guide/tools/oldheritage/scratch/-Users-ekam-Downloads-404-thread/1240a462-7f52-4055-aeb3-fcd24a49ac51/scratchpad/bl/dbg.py").read()) if os.environ.get("DBG") else None
os.makedirs(OUT, exist_ok=True)
sc.render.image_settings.file_format = "PNG"
sc.render.filepath = os.path.join(OUT, "f_")
if "--still" in argv: sc.frame_set(int(argv[argv.index("--still") + 1])); sc.render.filepath = os.path.join(OUT, "still.png"); bpy.ops.render.render(write_still=True)
else: bpy.ops.render.render(animation=True)
