"""
Backend import parser for quiz files
Supports: .xlsx, .csv, .docx
"""
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import List
import io

router = APIRouter(prefix="/import", tags=["import"])

class ImportedQuestion(BaseModel):
    text: str
    type: str = "MCQ"
    options: List[str]
    correctIndex: int
    timeLimit: int = 30
    points: int = 100

class ImportResponse(BaseModel):
    questions: List[ImportedQuestion]
    total: int
    file_name: str

@router.post("/parse-excel")
async def parse_excel(file: UploadFile = File(...)):
    """Parse Excel file (.xlsx, .xls) with color detection for correct answers"""
    if not file.filename.lower().endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Invalid file format. Expected .xlsx or .xls")
    
    try:
        try:
            import openpyxl
        except ImportError:
            raise HTTPException(status_code=500, detail="Missing dependency: openpyxl")

        contents = await file.read()
        workbook = openpyxl.load_workbook(io.BytesIO(contents))
        worksheet = workbook.active
        
        questions: List[ImportedQuestion] = []
        
        # Expected columns: question, option A-D, time limit, points.
        for row in worksheet.iter_rows(min_row=2):
            if len(row) < 5:
                continue

            question_text = row[0].value
            if not question_text:
                break
            
            # Extract options (columns B-E = indices 1-4 in the row tuple)
            options = []
            correct_index = 0
            highlight_color = "00C6EFCE"  # Light green highlight for correct answer
            
            for option_index, cell in enumerate(row[1:5]):
                option_text = cell.value or ""
                options.append(str(option_text))
                
                # Check if cell has the highlight color
                if (cell.fill and 
                    cell.fill.start_color and 
                    hasattr(cell.fill.start_color, 'rgb')):
                    
                    rgb = str(cell.fill.start_color.rgb)
                    if highlight_color in rgb.upper():
                        correct_index = option_index
            
            # Extract time and points
            time_limit = row[5].value if len(row) > 5 and row[5].value is not None else 30
            points = row[6].value if len(row) > 6 and row[6].value is not None else 100
            
            try:
                time_limit = int(time_limit)
                points = int(points)
            except (ValueError, TypeError):
                time_limit = 30
                points = 100
            
            question = ImportedQuestion(
                text=str(question_text),
                type="MCQ",
                options=options,
                correctIndex=correct_index,
                timeLimit=time_limit,
                points=points
            )
            questions.append(question)
        
        return ImportResponse(
            questions=questions,
            total=len(questions),
            file_name=file.filename
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse Excel file: {str(e)}")

@router.post("/parse-docx")
async def parse_docx(file: UploadFile = File(...)):
    """Parse DOCX file with highlighting for correct answers"""
    if not file.filename.lower().endswith('.docx'):
        raise HTTPException(status_code=400, detail="Invalid file format. Expected .docx")
    
    try:
        try:
            from docx import Document
        except ImportError:
            raise HTTPException(status_code=500, detail="Missing dependency: python-docx")

        contents = await file.read()
        doc = Document(io.BytesIO(contents))
        
        paragraphs = [para for para in doc.paragraphs if para.text.strip()]
        questions: List[ImportedQuestion] = []
        i = 0

        def has_yellow_highlight(para) -> bool:
            return any(run.font.highlight_color == 7 for run in para.runs)

        while i + 4 < len(paragraphs):
            question_text = paragraphs[i].text.strip()

            # Skip document headings such as "BỘ CÂU HỎI..."
            if question_text.isupper() and "?" not in question_text:
                i += 1
                continue

            option_paragraphs = paragraphs[i + 1:i + 5]
            options = [option_para.text.strip() for option_para in option_paragraphs]
            correct_index = 0

            for option_index, option_para in enumerate(option_paragraphs):
                if has_yellow_highlight(option_para):
                    correct_index = option_index
                    break

            questions.append(
                ImportedQuestion(
                    text=question_text,
                    type="MCQ",
                    options=options,
                    correctIndex=correct_index,
                    timeLimit=30,
                    points=100
                )
            )
            i += 5
        
        return ImportResponse(
            questions=questions,
            total=len(questions),
            file_name=file.filename
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse DOCX file: {str(e)}")

@router.post("/parse-csv")
async def parse_csv(file: UploadFile = File(...)):
    """Parse CSV file"""
    if not file.filename.lower().endswith('.csv'):
        raise HTTPException(status_code=400, detail="Invalid file format. Expected .csv")
    
    try:
        contents = (await file.read()).decode('utf-8')
        lines = contents.split('\n')
        
        questions: List[ImportedQuestion] = []
        
        # Skip header
        for line in lines[1:]:
            if not line.strip():
                continue
            
            parts = [p.strip() for p in line.split(',')]
            if len(parts) < 8:
                continue
            
            question = ImportedQuestion(
                text=parts[0],
                type=parts[1] if parts[1] in ['MCQ', 'TRUE_FALSE'] else 'MCQ',
                options=parts[2:6],
                correctIndex=int(parts[6]),
                timeLimit=int(parts[7]) if parts[7].isdigit() else 30,
                points=int(parts[8]) if len(parts) > 8 and parts[8].isdigit() else 100
            )
            questions.append(question)
        
        return ImportResponse(
            questions=questions,
            total=len(questions),
            file_name=file.filename
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse CSV file: {str(e)}")
