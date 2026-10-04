##### ***Why a wrapper?***

As per the PRD document the OCR engine must be swappable (ML Kit in Expo, or cloud OCR later). So the UI will only ever call recognizeText(image, language) and never touch Tesseract directly. Swapping engines later means rewriting one file.

