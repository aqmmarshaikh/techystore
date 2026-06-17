import { toast } from "sonner";

type ErrorCategory = "REACT" | "FIREBASE" | "NETWORK" | "CHECKOUT" | "ADMIN" | "UNKNOWN";

interface ErrorLogContext {
  userId?: string;
  action?: string;
  resourceId?: string;
}

export class AppError extends Error {
  category: ErrorCategory;
  context?: ErrorLogContext;

  constructor(message: string, category: ErrorCategory = "UNKNOWN", context?: ErrorLogContext) {
    super(message);
    this.name = "AppError";
    this.category = category;
    this.context = context;
  }
}

export const ErrorHandler = {
  log: (error: any, category: ErrorCategory = "UNKNOWN", context?: ErrorLogContext) => {
    // Determine the error message
    let message = "An unexpected error occurred.";
    if (error instanceof Error) message = error.message;
    else if (typeof error === "string") message = error;

    // Developer Console Logging
    console.group(`🚨 [${category}] Error Captured`);
    console.error("Message:", message);
    if (context) console.table(context);
    console.error("Original Error:", error);
    console.groupEnd();

    // Firebase Error Translation
    if (message.includes("permission-denied")) {
      message = "You do not have permission to perform this action.";
    } else if (message.includes("network-request-failed")) {
      message = "Network error. Please check your internet connection.";
      category = "NETWORK";
    }

    return new AppError(message, category, context);
  },

  handle: (error: any, category: ErrorCategory = "UNKNOWN", customMessage?: string) => {
    const appError = ErrorHandler.log(error, category);
    
    // User-Friendly Toast Notification
    toast.error(customMessage || appError.message, {
      description: appError.category === "NETWORK" ? "Retrying automatically..." : "Please try again later.",
    });

    return appError;
  }
};
