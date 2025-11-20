import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Edit, UserX, Key } from 'lucide-react'
import AdminEditDialog from '@/components/ui/dialogs/admin-edit-dialog'
import AdminConfirmDeactivateDialog from '@/components/ui/dialogs/admin-confirm-deactivate-dialog'
import AdminResetPasswordDialog from '@/components/ui/dialogs/admin-reset-password-dialog'

export default function AdminActions({ user }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false)
  const [isResetOpen, setIsResetOpen] = useState(false)

  function handleSave(updated) {
    console.log('Saved admin:', updated)
    // TODO: call API / emit event to parent
  }

  function handleDeactivate() {
    console.log('Toggle deactivate for', user)
  }

  function handleResetPassword() {
    console.log('Reset password for', user)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem onClick={() => setIsOpen(true)}>
            <Edit className="h-4 w-4 mr-2" /> Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsDeactivateOpen(true)}>
            <UserX className="h-4 w-4 mr-2" /> Nonaktifkan
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsResetOpen(true)}>
            <Key className="h-4 w-4 mr-2" /> Reset Password
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AdminEditDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        user={user}
        onSave={(payload) => {
          handleSave(payload)
          setIsOpen(false)
        }}
      />

      <AdminConfirmDeactivateDialog
        open={isDeactivateOpen}
        onOpenChange={setIsDeactivateOpen}
        user={user}
        onConfirm={() => {
          handleDeactivate()
          setIsDeactivateOpen(false)
        }}
      />

      <AdminResetPasswordDialog
        open={isResetOpen}
        onOpenChange={setIsResetOpen}
        user={user}
        onConfirm={() => {
          handleResetPassword()
          setIsResetOpen(false)
        }}
      />
    </>
  )
}
