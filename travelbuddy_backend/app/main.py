from fastapi import FastAPI
from pydantic import BaseModel
import random
from fastapi.middleware.cors import CORSMiddleware
from fastapi import HTTPException
from .database import engine
from .models import Base
from sqlalchemy.orm import Session
from fastapi import Depends
from .database import SessionLocal
from .models import User
from fastapi import HTTPException
from .security import hash_password, verify_password



app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)


class RegisterRequest(BaseModel):
    email: str | None = None
    phone: str | None = None
    password: str
    role: str

class OTPRequest(BaseModel):
    identifier: str
    otp: str

class LoginRequest(BaseModel):
    identifier: str
    password: str

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/")
def home():
    return {"message": "Backend Running"}

@app.post("/register")
def register(data: RegisterRequest, db: Session = Depends(get_db)):

    print("Password received:", data.password)
    print("Password length:", len(data.password))

    if not data.email and not data.phone:
        raise HTTPException(status_code=400, detail="Email or phone required")

    existing_user = None

    if data.email:
        existing_user = db.query(User).filter(User.email == data.email).first()

    if not existing_user and data.phone:
        existing_user = db.query(User).filter(User.phone == data.phone).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")

    import random
    otp = str(random.randint(100000, 999999))

    new_user = User(
        email=data.email,
        phone=data.phone,
        password_hash=hash_password(data.password),
        role=data.role,
        is_verified=False,
        otp=otp
    )

    db.add(new_user)
    db.commit()

    return {
        "message": "User registered successfully",
        "generated_otp": otp
    }


@app.post("/verify-otp")
def verify_otp(data: OTPRequest, db: Session = Depends(get_db)):

    user = db.query(User).filter(
        (User.email == data.identifier)
    ).first()

    if not user:
        user = db.query(User).filter(
            (User.phone == data.identifier)
        ).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.otp != data.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    user.is_verified = True
    user.otp = None
    db.commit()

    return {"message": "OTP verified successfully"}


@app.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):

    user = db.query(User).filter(
        (User.email == data.identifier)
    ).first()

    if not user:
        user = db.query(User).filter(
            (User.phone == data.identifier)
        ).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not user.is_verified:
        raise HTTPException(status_code=400, detail="User not verified")

    if not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    return {
        "message": "Login successful",
        "token": "fake-jwt-token"
    }




