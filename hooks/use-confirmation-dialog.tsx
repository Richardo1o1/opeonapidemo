"use client"

import * as React from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ConfirmationDialogOptions {
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive"
}

type ConfirmCallback = () => void | Promise<void>
type CancelCallback = () => void | Promise<void>

interface UseConfirmationDialogReturn {
  ConfirmationDialog: React.FC
  confirm: (onConfirm: ConfirmCallback, onCancel?: CancelCallback, options?: ConfirmationDialogOptions) => void
}

export function useConfirmationDialog(defaultOptions?: ConfirmationDialogOptions): UseConfirmationDialogReturn {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [options, setOptions] = React.useState<ConfirmationDialogOptions>(
    defaultOptions || {
      title: "Are you sure?",
      description: "This action cannot be undone.",
      confirmText: "Confirm",
      cancelText: "Cancel",
      variant: "default",
    },
  )
  const [onConfirmCallback, setOnConfirmCallback] = React.useState<ConfirmCallback | null>(null)
  const [onCancelCallback, setOnCancelCallback] = React.useState<CancelCallback | null>(null)

  const confirm = React.useCallback(
    (onConfirm: ConfirmCallback, onCancel?: CancelCallback, customOptions?: ConfirmationDialogOptions) => {
      setOnConfirmCallback(() => onConfirm)
      if (onCancel) {
        setOnCancelCallback(() => onCancel)
      }
      if (customOptions) {
        setOptions((prev) => ({ ...prev, ...customOptions }))
      }
      setIsDialogOpen(true)
    },
    [],
  )

  const handleConfirm = React.useCallback(() => {
    if (onConfirmCallback) {
      onConfirmCallback()
    }
    setIsDialogOpen(false)
  }, [onConfirmCallback])

  const handleCancel = React.useCallback(() => {
    if (onCancelCallback) {
      onCancelCallback()
    }
    setIsDialogOpen(false)
  }, [onCancelCallback])

  const ConfirmationDialog: React.FC = React.useCallback(
    () => (
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{options.title}</AlertDialogTitle>
            <AlertDialogDescription>{options.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>{options.cancelText}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={
                options.variant === "destructive"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : ""
              }
            >
              {options.confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    ),
    [isDialogOpen, options, handleConfirm, handleCancel],
  )

  return { ConfirmationDialog, confirm }
}

