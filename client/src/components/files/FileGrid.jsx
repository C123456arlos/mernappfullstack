import React from 'react'
import { useApp } from '../../context/AppContext'
import { Spinner } from '../ui/Spinner'
import { EmptyState } from '../ui/EmptyState'
import FolderCard from '../folders/FolderCard'
import FileCard from './FileCard'

const FileGrid = ({onFolderClick, onPreviewFile, onShareItem, onRenameItem, onMoveItem, onDeleteItem}) => {
    const { folders, files, isDriveLoading } = useApp()
    if (isDriveLoading) {
        return (
            <div className='py-20 flex flex-col items-center justify-between gap-3 text-slate-500'>
                <Spinner size='lg' className='text-orange-600'></Spinner>
                <p className='text-sm font-semibold'>loading items</p>
            </div>
        )
    }
    const hasFolders = folders && folders.length > 0
    const hasFiles = files && files.length > 0
    if (!hasFolders && !hasFiles) {
        return <EmptyState></EmptyState>
    }
  return (
      <div className='space-y-6'>
          {hasFolders && (
              <div>
                  <h3 className='text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3'>folders</h3>
                  <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                      {folders.map((folder) => (
                          <FolderCard key={folder.id} folder={folder} onClick={onFolderClick} onShare={(item) => onShareItem({ ...item, item_type: 'folder' })}
                              onRename={(item) => onRenameItem({ ...item, item_type: 'folder' })}
                              onMove={(item) => onMoveItem({ ...item, item_type: 'folder' })}
                              onDelete={(item)=>onDeleteItem({...item, item_type:'folder'})}
                          ></FolderCard>
                      ))}
                  </div>
              </div>
          )}
          {hasFiles && <div>
              <h3 className='text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3'>files</h3>
              <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                  {files.map((file) => (
                      <FileCard key={file.id} file={file} onPreview={onPreviewFile}
                      onShare={(item) => onShareItem({ ...item, item_type: 'file' })}
                              onRename={(item) => onRenameItem({ ...item, item_type: 'file' })}
                              onMove={(item) => onMoveItem({ ...item, item_type: 'file' })}
                              onDelete={(item)=>onDeleteItem({...item, item_type:'file'})}></FileCard>
                  ))}
              </div>
          </div>}
    </div>
  )
}

export default FileGrid