// User DTOs
export interface UserRequestDto {
  name: string;
  email: string;
  role: string;
  password: string;
}

export interface UserResponseDto {
  id: number;
  name: string;
  email: string;
  role: string;
}

// Book DTOs
export interface BookDto {
  id?: string;
  title: string;
  author: string;
  description: string;
  isbn: string;
  coverImageUrl?: string;
  pdfFileUrl?: string;
}
