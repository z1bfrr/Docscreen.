from pydantic_settings import BaseSettings
from pathlib import Path

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite+aiosqlite:///./docscreen.db"
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE_MB: int = 20
    PIPELINE_VERSION: str = "0.1.0"
    MODEL_VERSION: str = "IF-001"
    OCR_ENGINE: str = "auto"
    CORS_ORIGINS: str = "http://localhost:3000"
    MODEL_PATH: str = "./models_store/isolation_forest.pkl"
    DEMO_DOCS_DIR: str = "../data/synthetic"

    @property
    def upload_path(self) -> Path:
        return Path(self.UPLOAD_DIR)

    @property
    def model_path(self) -> Path:
        return Path(self.MODEL_PATH)

    @property
    def demo_docs_path(self) -> Path:
        return Path(self.DEMO_DOCS_DIR)

    @property
    def cors_origins_list(self) -> list:
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
