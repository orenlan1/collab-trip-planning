// middlewares/isAuthenticated.ts
import type { Request, Response, NextFunction } from "express";
import userService from "../services/user-service.js";

export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }

  res.status(401).json({ message: "Unauthorized" });
}

// Middleware to check if user is a member of the trip
export async function isTripMember(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const tripId = req.params.tripId;
  
  if (!tripId) {
    return res.status(400).json({ error: "Trip ID is required" });
  }

  try {
    const isMember = await userService.isMemberOfTheTrip(req.user.id, tripId);
    
    if (!isMember) {
      return res.status(403).json({ error: "You are not a member of this trip" });
    }

    next();
  } catch (error) {
    console.error("Error checking trip membership:", error);
    res.status(500).json({ error: "Failed to verify trip membership" });
  }
}

// Middleware to check if user is a member of the trip associated with an expense
export async function isExpenseTripMember(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const expenseId = req.params.expenseId;
  
  if (!expenseId) {
    return res.status(400).json({ error: "Expense ID is required" });
  }

  try {
    // Import prisma here to avoid circular dependencies
    const { prisma } = await import("../prisma/client.js");
    
    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
      include: {
        budget: {
          select: {
            tripId: true
          }
        }
      }
    });

    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    const tripId = expense.budget.tripId;
    const isMember = await userService.isMemberOfTheTrip(req.user.id, tripId);
    
    if (!isMember) {
      return res.status(403).json({ error: "You are not a member of this trip" });
    }

    next();
  } catch (error) {
    console.error("Error checking expense trip membership:", error);
    res.status(500).json({ error: "Failed to verify trip membership" });
  }
}
