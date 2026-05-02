import hashlib

def hash_password(password: str):
    # Use SHA-256 instead of bcrypt to avoid compatibility issues
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(plain_password: str, hashed_password: str):
    return hashlib.sha256(plain_password.encode()).hexdigest() == hashed_password