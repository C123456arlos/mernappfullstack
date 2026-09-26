import React, { useState } from 'react'
import { useDrive } from '../../hooks/useDrive'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'

const CreateFolderModal = ({ isOpen, onClose }) => {
    const [name, setName] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const { createFolder } = useDrive()
    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!name.trim()) return
        setIsLoading(true)
        await createFolder(name.trim())
        setIsLoading(false)
        setName('')
        onClose()
    }
  return (
      <Modal isOpen={isOpen} onClose={onClose} title={'new folder'}>
          <form className='space-y-4' onSubmit={handleSubmit}>
              <Input label='folder name' placeholder='untitled folder' value={name}
                  onChange={(e) => setName(e.target.value)} autoFocus required></Input>
              <div className='flex items-center justify-end gap-3 pt-2'>
                  <Button variant='ghost' onClick={onClose} type='button'>
                      cancel
                  </Button>
                  <Button variant='primary' type='submit' disabled={!name.trim()} isLoading={isLoading}>
                      create
                  </Button>
              </div>
          </form>
    </Modal>
  )
}

export default CreateFolderModal