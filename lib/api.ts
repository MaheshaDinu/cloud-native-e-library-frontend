import axios from "axios";
import type { UserRequestDto, UserResponseDto, BookDto } from "./types";

// Configure base URL - update this to match your backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const userApi = axios.create({
  baseURL: `/users`,
  headers: {
    "Content-Type": "application/json",
  },
});

const bookApi = axios.create({
  baseURL: `/books`,
  headers: {
    "Content-Type": "application/json",
  },
});

const mediaApi = axios.create({
  baseURL: `/media`,
});

// User Service API
export const userService = {
  createUser: async (user: UserRequestDto): Promise<UserResponseDto> => {
    const response = await userApi.post<UserResponseDto>("/create", user);
    return response.data;
  },

  getUser: async (id: number): Promise<UserResponseDto> => {
    const response = await userApi.get<UserResponseDto>(`/${id}`);
    return response.data;
  },

  getAllUsers: async (): Promise<UserResponseDto[]> => {
    const response = await userApi.get<UserResponseDto[]>("/all");
    return response.data;
  },

  updateUser: async (id: number, user: UserRequestDto): Promise<UserResponseDto> => {
    const response = await userApi.put<UserResponseDto>(`/${id}`, user);
    return response.data;
  },

  deleteUser: async (id: number): Promise<string> => {
    const response = await userApi.delete<string>(`/${id}`);
    return response.data;
  },
};

// Book Service API
export const bookService = {
  createBook: async (book: BookDto): Promise<BookDto> => {
    const response = await bookApi.post<BookDto>("/create", book);
    return response.data;
  },

  getBook: async (id: string): Promise<BookDto> => {
    const response = await bookApi.get<BookDto>(`/${id}`);
    return response.data;
  },

  getAllBooks: async (): Promise<BookDto[]> => {
    const response = await bookApi.get<BookDto[]>("/all");
    return response.data;
  },

  updateBook: async (id: string, book: BookDto): Promise<BookDto> => {
    const response = await bookApi.put<BookDto>(`/${id}`, book);
    return response.data;
  },

  deleteBook: async (id: string): Promise<void> => {
    await bookApi.delete(`/${id}`);
  },
};

// Media Service API
export const mediaService = {
  uploadCover: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await mediaApi.post<string>("/upload/cover", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  uploadPdf: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await mediaApi.post<string>("/upload/pdf", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  getFileUrl: (filename: string): string => {
    return `${API_BASE_URL}/media/download?filename=${encodeURIComponent(filename)}`;
  },

  listAllFiles: async (type?: string): Promise<string[]> => {
    const params = type ? { type } : {};
    const response = await mediaApi.get<string[]>("/all", { params });
    return response.data;
  },

  deleteFile: async (filename: string): Promise<string> => {
    const response = await mediaApi.delete<string>("/delete", {
      params: { filename },
    });
    return response.data;
  },
};
