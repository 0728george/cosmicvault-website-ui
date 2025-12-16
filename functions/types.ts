export interface User {
  id: string;
  email: string;
  password_hash: string;
  salt: string;
  wrapped_key: string;
}

export interface Secret {
  id: string;
  user_id: string;
  name: string;
  cipher_text: string;
  iv: string;
}