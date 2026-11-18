"""Regression tests for lint_cases.py and vo_fixline.py (run: python -m pytest tools/case-build/test_lint_vo.py)."""
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).parent))
import lint_cases as lc  # noqa: E402
import vo_fixline as vf  # noqa: E402

OLD1 = "const names = (J.private_names_bboxes || []).map(xywh).filter((b) => b && (!A || b[1] >= A.T)).map((b) => shY(b, A));"
OLD2 = "const names = (J.private_names_bboxes || []).map(xywh).filter((b) => b && b[1] >= A.T).map(sh);"


@pytest.mark.parametrize('src', [OLD1, OLD2])
def test_blur_filter_that_drops_straddling_boxes_is_found_and_fixed(src):
    # coc2h-vol1 case 09 found it: a face box crossing the headline cut was dropped -> half a face unblurred
    assert lc.lint_text(src) == [('BLUR_T', 1)]
    fixed = lc.fix_text(src)
    assert lc.lint_text(fixed) == [] and 'b[3] > A.T' in fixed and 'Math.max(b[1], A.T)' in fixed


def test_fixed_filter_keeps_straddling_box_clipped():
    # the fixed JS filter, evaluated in Python: box y 200..300 with cut T=260 -> kept as y 260..300
    A_T = 260; b = [0, 200, 50, 300]
    keep = b[3] > A_T; clipped = [b[0], max(b[1], A_T), b[2], b[3]]
    assert keep and clipped == [0, 260, 50, 300]


def test_vo_fix_text_exact_once():
    rows = [{'id': 'vo_001', 'text': 'The lot is black. The lot is black.'}, {'id': 'vo_002', 'text': 'x'}]
    with pytest.raises(ValueError): vf.fix_text(rows, 'vo_001', 'The lot is black.', 'y')   # twice -> refuse
    assert vf.fix_text(rows, 'vo_002', 'x', 'z') == 'z'
    with pytest.raises(KeyError): vf.fix_text(rows, 'vo_009', 'a', 'b')
    with pytest.raises(ValueError): vf.fix_text(rows, 'vo_002', 'missing', 'b')


def test_farm_parts_window_media_on_and_order_kept(tmp_path):
    import json
    import farm_parts as fp
    prj, eng = tmp_path / 'prj', tmp_path / 'eng'
    (prj / 'ref' / 'build').mkdir(parents=True)
    for f in ('farm_entry.py', 'farm_contract.py'): (prj / 'ref' / 'build' / f).write_text('#', encoding='utf-8')
    for p in ('b', 'a'): (eng / p).mkdir(parents=True); (eng / p / 'index.html').write_text('x', encoding='utf-8')
    parts, missing = fp.setup(str(prj), str(eng), 'ref', ['b', 'a', 'c'])
    assert [x['name'] for x in parts] == ['b', 'a'] and missing == ['c']
    assert json.load(open(prj / 'a' / 'build' / 'hf_farm.json'))['window_media'] is True
    assert [x['name'] for x in json.load(open(prj / 'project.json'))['parts']] == ['b', 'a']
