# OCR Experiments (Phase 2)

Page confidence is an average Tesseract reports. It is NOT accuracy and is NOT comparable across page segmentation modes (psm). Judge by readable text.

| #   | Image                                                         | Language | Settings                                                | Conf.                  | Result                                                                                                      | Valid?          |
| --- | ------------------------------------------------------------- | -------- | ------------------------------------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------- | --------------- |
| 1   | Marathi newspaper (clean screenshot)                          | mr       | default                                                 | ~90%                   | nearly all text correct; a few wrong words (Hazmat, ARES TT, प्रवेज्)                                       | yes             |
| 2   | Same                                                          | mr       | word flagging at 60%                                    | -                      | flagged 2 of 3 real errors + 4 false alarms; missed प्रवेज् (79%)                                           | yes             |
| 3   | Marathi newspaper (838x442)                                   | mr       | psm=11                                                  | 90%                    | same score as default; reading order not checked                                                            | yes             |
| 4   | English newspaper (multi-column, 2000x1500)                   | en       | psm=11                                                  | 81%                    | readable fragments, columns interleaved, line starts cut off                                                | yes             |
| 5   | Marathi bank form (phone photo)                               | mr       | default                                                 | 69%                    | field labels mostly readable; junk in boxed areas                                                           | yes             |
| 6   | Marathi bank form (upright saved image 947x1432)              | mr       | default                                                 | 72%                    | most labels readable; address-table labels (राज्य, पिन कोड, एसटीडी कोड, ईमेल) missing; fused words          | yes             |
| 7   | Same                                                          | mr       | psm=6                                                   | 72%                    | identical to default                                                                                        | yes             |
| 8   | English Account Opening Form (CIF sheet, phone photo)         | en       | default                                                 | 46%                    | ~6 clean labels; comb boxes read as [TT TTT]; fused words                                                   | yes             |
| 9   | Same document                                                 | en       | size=3200 / psm=6 / psm=11 / adaptive / adaptive+psm=11 | 46 / 46 / 69 / 35 / 49 | text not inspected                                                                                          | indicative only |
| 10  | English debit card form (895x857)                             | en       | default                                                 | 33%                    | ~10 clean labels; fused/garbled lines                                                                       | yes             |
| 11  | Same                                                          | en       | psm=11                                                  | 69%                    | ~30+ clean labels on separate lines; reading order lost                                                     | yes             |
| 12  | Marathi voter ID form (Form 8, 1500x2000, phone camera photo) | mr       | psm=11                                                  | 81%                    | most text readable; order jumbled; dropped labels (नाव, लिंग, जन्मतारीख, नात्याचे नाव, हो/नाही)             | yes             |
| 13  | Same                                                          | mr       | default                                                 | 81%                    | same score, better reading order, more labels recovered; a few word errors (बचन, विश्‍वारापूर्वक, कर्णवधीर) | yes             |
| 14  | Marathi bank form, sideways                                   | en       | default / psm=6 / psm=11                                | 28 / 29 / 51           | pure junk (page rotated 90 degrees AND English selected)                                                    | no              |

## Findings

- With an upright image and the correct language, default settings read most Marathi field labels (72-81%).
- The best psm depends on layout: sparse mode (psm=11) won clearly on the box-heavy English debit card form (33% -> 69%, ~10 -> ~30+ labels) but default won on the text-heavy Marathi voter form (same 81%, better order and more labels).
- Page confidence cannot choose between modes: identical 81% for both modes on the voter form; psm=11 raised the score while the text got worse on a sideways page. Candidate metric for Phase 7: count of confident real words.
- psm=11 breaks reading order on normal text and multi-column pages.
- Adaptive thresholding lowered confidence on the English form (46% -> 35%); left in code, off by default.
- Resizing to 3200px made no difference because the images were already smaller (the code never upscales).
- Sideways pages give pure junk; the wrong language gives confident-looking junk in the wrong script.
- Grids of one-character boxes are read as stray characters and can swallow nearby labels (address table in the Marathi bank form).
- Wrong words can score high (प्रवेज् at 79%), so confidence flags are a hint, not a guarantee.
- A single page can contain several separate applications (voter ID Form 8), so the explainer should help choose the relevant section.

## To run in Phase 7 (test set)

- default vs psm=11 per layout type, using the confident-real-word count as the picker
- mar vs mar+eng; preprocessing on vs off; forms vs plain text
- A fair side-by-side with Google Lens on the same photos
