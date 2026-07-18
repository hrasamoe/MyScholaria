import { Request, Response, Router } from "express";
import { AuthRequest, RequireAuth } from "../../middleware/auth.middleware";
import { bookSchema, loanSchema } from "./library.schema";
import {
  getBooks,
  createBook,
  updateBook,
  deleteBook,
  getLoans,
  createLoan,
  returnLoan,
  getLibraryStats,
} from "./library.service";

export const libraryRouter = Router();

libraryRouter.get(
  "/books",
  RequireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const books = await getBooks(req.establishmentID as string);
      res.status(200).json(books);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
);

libraryRouter.post(
  "/books",
  RequireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const parsed = bookSchema.parse(req.body);
      const book = await createBook(parsed, req.establishmentID as string);
      res.status(201).json({ message: "Book added successfully", data: book });
    } catch (error: any) {
      if (error.errors)
        return res.status(400).json({ message: error.errors[0].message });
      res.status(400).json({ message: error.message });
    }
  },
);

libraryRouter.put(
  "/books/:id",
  RequireAuth,
  async (req: Request, res: Response) => {
    try {
      const parsed = bookSchema.parse(req.body);
      const bookId = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
      const book = await updateBook(bookId, parsed);
      res
        .status(200)
        .json({ message: "Book updated successfully", data: book });
    } catch (error: any) {
      if (error.errors)
        return res.status(400).json({ message: error.errors[0].message });
      res.status(400).json({ message: error.message });
    }
  },
);

libraryRouter.delete(
  "/books/:id",
  RequireAuth,
  async (req: Request, res: Response) => {
    try {
      const bookId = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
      await deleteBook(bookId);
      res.status(200).json({ message: "Book deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
);

libraryRouter.get(
  "/loans",
  RequireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const loans = await getLoans(req.establishmentID as string);
      res.status(200).json(loans);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
);

libraryRouter.post(
  "/loans",
  RequireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const parsed = loanSchema.parse(req.body);
      const loan = await createLoan(parsed, req.establishmentID as string);
      res
        .status(201)
        .json({ message: "Loan created successfully", data: loan });
    } catch (error: any) {
      if (error.errors)
        return res.status(400).json({ message: error.errors[0].message });
      res.status(400).json({ message: error.message });
    }
  },
);

libraryRouter.put(
  "/loans/:id/return",
  RequireAuth,
  async (req: Request, res: Response) => {
    try {
      const loanId = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
      const fineAmount = req.body?.fineAmount
        ? Number(req.body.fineAmount)
        : undefined;
      await returnLoan(loanId, fineAmount);
      res.status(200).json({ message: "Book marked as returned" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },
);

libraryRouter.get(
  "/stats",
  RequireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const stats = await getLibraryStats(req.establishmentID as string);
      res.status(200).json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
);
