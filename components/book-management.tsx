"use client";

import { useState, useRef } from "react";
import useSWR, { mutate } from "swr";
import { bookService, mediaService } from "@/lib/api";
import type { BookDto } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  Loader2,
  Image,
  FileText,
  ExternalLink,
  Upload,
  X,
  Check,
} from "lucide-react";

interface BookFormData {
  title: string;
  author: string;
  description: string;
  isbn: string;
  coverImageUrl: string;
  pdfFileUrl: string;
}

interface FileUploadState {
  coverImage: File | null;
  pdfFile: File | null;
  coverImageUploading: boolean;
  pdfFileUploading: boolean;
  coverImageUploaded: boolean;
  pdfFileUploaded: boolean;
}

export function BookManagement() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<BookDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { data: books, error, isLoading: isFetching } = useSWR<BookDto[]>(
    "books",
    bookService.getAllBooks
  );

  const [formData, setFormData] = useState<BookFormData>({
    title: "",
    author: "",
    description: "",
    isbn: "",
    coverImageUrl: "",
    pdfFileUrl: "",
  });

  const [fileState, setFileState] = useState<FileUploadState>({
    coverImage: null,
    pdfFile: null,
    coverImageUploading: false,
    pdfFileUploading: false,
    coverImageUploaded: false,
    pdfFileUploaded: false,
  });

  const coverInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setFormData({
      title: "",
      author: "",
      description: "",
      isbn: "",
      coverImageUrl: "",
      pdfFileUrl: "",
    });
    setFileState({
      coverImage: null,
      pdfFile: null,
      coverImageUploading: false,
      pdfFileUploading: false,
      coverImageUploaded: false,
      pdfFileUploaded: false,
    });
    setEditingBook(null);
  };

  const handleCoverImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileState((prev) => ({
        ...prev,
        coverImage: file,
        coverImageUploaded: false,
      }));
      setFormData((prev) => ({ ...prev, coverImageUrl: "" }));
    }
  };

  const handlePdfSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileState((prev) => ({
        ...prev,
        pdfFile: file,
        pdfFileUploaded: false,
      }));
      setFormData((prev) => ({ ...prev, pdfFileUrl: "" }));
    }
  };

  const uploadCoverImage = async (): Promise<string> => {
    if (!fileState.coverImage) return formData.coverImageUrl;
    if (fileState.coverImageUploaded && formData.coverImageUrl) return formData.coverImageUrl;

    setFileState((prev) => ({ ...prev, coverImageUploading: true }));
    try {
      const filename = await mediaService.uploadCover(fileState.coverImage);
      setFormData((prev) => ({ ...prev, coverImageUrl: filename }));
      setFileState((prev) => ({
        ...prev,
        coverImageUploading: false,
        coverImageUploaded: true,
      }));
      return filename;
    } catch (err) {
      console.error("Failed to upload cover image:", err);
      setFileState((prev) => ({ ...prev, coverImageUploading: false }));
      throw err;
    }
  };

  const uploadPdfFile = async (): Promise<string> => {
    if (!fileState.pdfFile) return formData.pdfFileUrl;
    if (fileState.pdfFileUploaded && formData.pdfFileUrl) return formData.pdfFileUrl;

    setFileState((prev) => ({ ...prev, pdfFileUploading: true }));
    try {
      const filename = await mediaService.uploadPdf(fileState.pdfFile);
      setFormData((prev) => ({ ...prev, pdfFileUrl: filename }));
      setFileState((prev) => ({
        ...prev,
        pdfFileUploading: false,
        pdfFileUploaded: true,
      }));
      return filename;
    } catch (err) {
      console.error("Failed to upload PDF file:", err);
      setFileState((prev) => ({ ...prev, pdfFileUploading: false }));
      throw err;
    }
  };

  const handleCreate = async () => {
    setIsLoading(true);
    try {
      // First upload files if selected
      const coverImageUrl = await uploadCoverImage();
      const pdfFileUrl = await uploadPdfFile();

      // Then create the book with the URLs
      const bookData: BookDto = {
        title: formData.title,
        author: formData.author,
        description: formData.description,
        isbn: formData.isbn,
        coverImageUrl,
        pdfFileUrl,
      };

      await bookService.createBook(bookData);
      mutate("books");
      setIsCreateOpen(false);
      resetForm();
    } catch (err) {
      console.error("Failed to create book:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingBook?.id) return;
    setIsLoading(true);
    try {
      // First upload files if new ones are selected
      const coverImageUrl = await uploadCoverImage();
      const pdfFileUrl = await uploadPdfFile();

      // Then update the book with the URLs
      const bookData: BookDto = {
        title: formData.title,
        author: formData.author,
        description: formData.description,
        isbn: formData.isbn,
        coverImageUrl,
        pdfFileUrl,
      };

      await bookService.updateBook(editingBook.id, bookData);
      mutate("books");
      setEditingBook(null);
      resetForm();
    } catch (err) {
      console.error("Failed to update book:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this book?")) return;
    try {
      await bookService.deleteBook(id);
      mutate("books");
    } catch (err) {
      console.error("Failed to delete book:", err);
    }
  };

  const openEditDialog = (book: BookDto) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      description: book.description,
      isbn: book.isbn,
      coverImageUrl: book.coverImageUrl || "",
      pdfFileUrl: book.pdfFileUrl || "",
    });
    setFileState({
      coverImage: null,
      pdfFile: null,
      coverImageUploading: false,
      pdfFileUploading: false,
      coverImageUploaded: false,
      pdfFileUploaded: false,
    });
  };

  const removeCoverImage = () => {
    setFileState((prev) => ({
      ...prev,
      coverImage: null,
      coverImageUploaded: false,
    }));
    setFormData((prev) => ({ ...prev, coverImageUrl: "" }));
    if (coverInputRef.current) coverInputRef.current.value = "";
  };

  const removePdfFile = () => {
    setFileState((prev) => ({
      ...prev,
      pdfFile: null,
      pdfFileUploaded: false,
    }));
    setFormData((prev) => ({ ...prev, pdfFileUrl: "" }));
    if (pdfInputRef.current) pdfInputRef.current.value = "";
  };

  const renderBookForm = ({
    onSubmit,
    submitLabel,
  }: {
    onSubmit: () => void;
    submitLabel: string;
  }) => (
    <div className="space-y-4 py-4">
      <Input
        placeholder="Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
      />
      <Input
        placeholder="Author"
        value={formData.author}
        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
      />
      <Textarea
        placeholder="Description"
        value={formData.description}
        onChange={(e) =>
          setFormData({ ...formData, description: e.target.value })
        }
        rows={3}
      />
      <Input
        placeholder="ISBN"
        value={formData.isbn}
        onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
      />

      {/* Cover Image Upload */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <Image className="h-4 w-4" />
          Cover Image
        </label>
        <div className="flex items-center gap-2">
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            onChange={handleCoverImageSelect}
            className="hidden"
            id="cover-upload"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => coverInputRef.current?.click()}
            disabled={fileState.coverImageUploading}
          >
            <Upload className="mr-2 h-4 w-4" />
            Choose Image
          </Button>
          {(fileState.coverImage || formData.coverImageUrl) && (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-sm text-muted-foreground truncate">
                {fileState.coverImage?.name || formData.coverImageUrl}
              </span>
              {fileState.coverImageUploaded && (
                <Check className="h-4 w-4 text-green-500 shrink-0" />
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 shrink-0"
                onClick={removeCoverImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        {formData.coverImageUrl && !fileState.coverImage && (
          <p className="text-xs text-muted-foreground">
            Current: {formData.coverImageUrl}
          </p>
        )}
      </div>

      {/* PDF File Upload */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <FileText className="h-4 w-4" />
          PDF File
        </label>
        <div className="flex items-center gap-2">
          <input
            ref={pdfInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handlePdfSelect}
            className="hidden"
            id="pdf-upload"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => pdfInputRef.current?.click()}
            disabled={fileState.pdfFileUploading}
          >
            <Upload className="mr-2 h-4 w-4" />
            Choose PDF
          </Button>
          {(fileState.pdfFile || formData.pdfFileUrl) && (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-sm text-muted-foreground truncate">
                {fileState.pdfFile?.name || formData.pdfFileUrl}
              </span>
              {fileState.pdfFileUploaded && (
                <Check className="h-4 w-4 text-green-500 shrink-0" />
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 shrink-0"
                onClick={removePdfFile}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        {formData.pdfFileUrl && !fileState.pdfFile && (
          <p className="text-xs text-muted-foreground">
            Current: {formData.pdfFileUrl}
          </p>
        )}
      </div>

      <Button onClick={onSubmit} disabled={isLoading} className="w-full">
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {submitLabel}
      </Button>
    </div>
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          <CardTitle>Book Catalog</CardTitle>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Book
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Book</DialogTitle>
            </DialogHeader>
            {renderBookForm({ onSubmit: handleCreate, submitLabel: "Create Book" })}
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {error && (
          <p className="text-destructive text-sm mb-4">
            Failed to load books. Make sure your API is running.
          </p>
        )}
        {isFetching ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {books?.map((book) => (
              <Card key={book.id} className="overflow-hidden">
                <div className="aspect-[3/4] bg-muted flex items-center justify-center relative">
                  {book.coverImageUrl ? (
                    <img
                      src={mediaService.getFileUrl(book.coverImageUrl)}
                      alt={book.title}
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                        (
                          e.target as HTMLImageElement
                        ).nextElementSibling?.classList.remove("hidden");
                      }}
                    />
                  ) : null}
                  <div
                    className={`flex flex-col items-center text-muted-foreground ${book.coverImageUrl ? "hidden" : ""}`}
                  >
                    <Image className="h-12 w-12 mb-2" />
                    <span className="text-sm">No Cover</span>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg line-clamp-1">
                    {book.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    by {book.author}
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {book.description}
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    ISBN: {book.isbn}
                  </p>

                  <div className="flex gap-2 mb-3">
                    {book.pdfFileUrl && (
                      <a
                        href={mediaService.getFileUrl(book.pdfFileUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <FileText className="h-3 w-3" />
                        View PDF
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Dialog
                      open={editingBook?.id === book.id}
                      onOpenChange={(open) => {
                        if (!open) {
                          setEditingBook(null);
                          resetForm();
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => openEditDialog(book)}
                        >
                          <Pencil className="mr-2 h-3 w-3" />
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Edit Book</DialogTitle>
                        </DialogHeader>
                        {renderBookForm({
                          onSubmit: handleUpdate,
                          submitLabel: "Update Book"
                        })}
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => book.id && handleDelete(book.id)}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {books?.length === 0 && (
              <div className="col-span-full text-center text-muted-foreground py-8">
                No books found. Add one to get started.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
