from pydantic import BaseModel
from typing import List

class CommentBatch(BaseModel):
    comments: List[str]

class PredictionResponse(BaseModel):
    sentiments: List[int]
    confidences: List[float]
