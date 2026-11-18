# Example commands (PowerShell). Run from tools/algrow-voice.
python algrow_voice.py credits                                   # key check + credits, costs nothing
python algrow_voice.py voices                                    # list Stealth voices (name + voice_id)
python algrow_voice.py say "The driver was never seen again." -o out/test_line
python algrow_voice.py file templates/narration_template.txt -o out/narration
python algrow_voice.py --voice "Horror Channel Tokyo" batch templates/batch_template.csv -o out/batch --workers 3
