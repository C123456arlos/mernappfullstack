import { createContext, useCallback, useContext, useEffect, useState } from "react"
import toast from "react-hot-toast"
import api from "../config/api"

const AppContext = createContext()
const ROOT_BREADCRUMB=[{id:null, name:'My Drive'}]
const getErrMsg=(err, fallback)=>err.response?.data?.error || fallback
export const AppProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [currentFolderId, setCurrentFolderId] = useState(null)
    const [breadcrumbs, setBreadcrumbs] = useState(ROOT_BREADCRUMB)
    const [folders, setFolders] = useState([])
    const [files, setFiles] = useState([])
    const [isDriveLoading, setIsDriveLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [sortBy, setSortBy]= useState('name_asc')
    const refreshUser = useCallback(async() => {
        try {
            const { data } = await api.get('/api/auth/me')
            setUser(data.user)
            return data.user
        } catch (error) {
            setUser(null)
            return null
        }
    }, [])
    useEffect(() => {
        refreshUser().finally(()=>setIsLoading(false))
    },[refreshUser])
    const authAction = async(requestFn, successMsg, errorFallback)=> {
    try {
        const { data } = await requestFn()
        setUser(data.user)
        if (successMsg) toast.success(successMsg)
        return true
    } catch (error) {
        toast.error(getErrMsg(error, errorFallback))
        return false
    }
    }
    const login = (email, password) => {
        return authAction(()=>api.post('/api/auth/login', {email, password}), 'welcome back', 'login failed')
    }
    const register = (name, email, password) => {
        return authAction(()=>api.post('/api/auth/register', {name, email, password}), 'account created successfully', 'registration failed')
    }
    const logout = async () => {
        try {
            await api.post('/api/auth/logout')
            setUser(null)
            toast.success('logged out')
        } catch (error) {
            toast.error('logout error')
        }
    }
    const fetchDriveContent = useCallback(() => {
        async (folderId= currentFolderId, search=searchQuery, sort=sortBy) => {
            if (!user) return
            setIsDriveLoading(true)
            try {
                const parentParam = folderId || 'null'
                const [folderRes, fileRes, detailRes] = await Promise.all([
                    api.get('/api/folders', {params:{params_id:parentParam}}), 
                    api.get('/api/files', { params: { folder_id: parentParam, parentParam, search, sort } }),
                    folderId ? api.get(`/api/folders/${folderId}`):null
                ])
                setFolders(folderRes.data.folders)
                setFiles(fileRes.data.files)
                setBreadcrumbs(detailRes?.data?.breadcrumbs || ROOT_BREADCRUMB)
            } catch  {
                toast.error('error loading drive contents')
            } finally {
                setIsDriveLoading(false)
            }
        }
    },[user, currentFolderId, searchQuery, sortBy])
    const value = {
        user, setUser, login, register, logout, isLoading, isAuthenticated: !!user, isUploading,
        setIsUploading, 
        uploadProgress, 
        setUploadProgress,
        refreshUser, currentFolderId,
        setCurrentFolderId, breadcrumbs, folders, setFolders, files, setFiles, isDriveLoading,
        fetchDriveContent, searchQuery, setSearchQuery, sortBy, setSortBy
    }
    return <AppContext.Provider value={value}>
        {children}
    </AppContext.Provider>
}
export const useApp= ()=>useContext(AppContext)