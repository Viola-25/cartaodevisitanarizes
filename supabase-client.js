// =====================================================
// Cliente Supabase - Narizes de Plantão
// =====================================================

const SUPABASE_URL = 'https://zrkleykmyrovovysrgti.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_HB8AP1GbBrzyObm0Y9tqTg_oRzJLApn'

// Importar Supabase
let supabase = null

export async function initSupabase() {
  if (supabase) return supabase
  
  const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.47.0/+esm')
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  return supabase
}

// =====================================================
// AUTENTICAÇÃO
// =====================================================

export async function login(email, password) {
  const db = await initSupabase()
  const { data, error } = await db.auth.signInWithPassword({ email, password })

  if (error || !data?.user) {
    throw new Error('Email ou senha inválidos')
  }

  sessionStorage.setItem('user_id', data.user.id)
  sessionStorage.setItem('user_email', email)

  return { success: true, user: data.user }
}

export async function logout() {
  const db = await initSupabase()
  await db.auth.signOut()
  sessionStorage.removeItem('user_id')
  sessionStorage.removeItem('user_email')
  return { success: true }
}

export function isLoggedIn() {
  return !!sessionStorage.getItem('user_id')
}

export function getCurrentUser() {
  return {
    id: sessionStorage.getItem('user_id'),
    email: sessionStorage.getItem('user_email')
  }
}

// =====================================================
// PALHAÇOS
// =====================================================

export async function getPalhacos() {
  const db = await initSupabase()
  
  const { data, error } = await db
    .from('palhacos')
    .select('*')
    .order('name', { ascending: true })
  
  if (error) {
    console.error('Erro ao buscar palhaços:', error)
    return []
  }
  
  return data.map(p => ({
    ...p,
    key: p.id // Compatibilidade com código antigo
  }))
}

export async function getByPalhacoId(palhaco_id) {
  const db = await initSupabase()
  
  const { data, error } = await db
    .from('palhacos')
    .select('*')
    .eq('palhaco_id', palhaco_id)
    .single()
  
  if (error) {
    console.error('Erro ao buscar palhaço:', error)
    return null
  }
  
  return {
    ...data,
    key: data.id
  }
}

export async function createPalhaco(palhaco_data) {
  const db = await initSupabase()
  
  const { data, error } = await db
    .from('palhacos')
    .insert([palhaco_data])
    .select()
  
  if (error) {
    console.error('Erro ao criar palhaço:', error)
    throw error
  }
  
  return data[0]
}

export async function updatePalhaco(palhaco_id, updates) {
  const db = await initSupabase()
  
  const { data, error } = await db
    .from('palhacos')
    .update(updates)
    .eq('id', palhaco_id)
    .select()
  
  if (error) {
    console.error('Erro ao atualizar palhaço:', error)
    throw error
  }
  
  return data[0]
}

export async function deletePalhaco(palhaco_id) {
  const db = await initSupabase()
  
  const { error } = await db
    .from('palhacos')
    .delete()
    .eq('id', palhaco_id)
  
  if (error) {
    console.error('Erro ao deletar palhaço:', error)
    throw error
  }
  
  return { success: true }
}

// =====================================================
// STORAGE - IMAGENS E ARQUIVOS
// =====================================================

export async function uploadImage(file, bucket = 'images') {
  const db = await initSupabase()

  const { data: authData } = await db.auth.getUser()
  if (!authData?.user) {
    throw new Error('Voce precisa estar logado para enviar imagens.')
  }
  
  const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`
  const filePath = bucket === 'images' ? `palhacos/${fileName}` : fileName
  
  const { data, error } = await db.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || 'application/octet-stream'
    })
  
  if (error) {
    console.error('Erro ao fazer upload:', error.message, error)
    throw new Error(error.message || 'Falha no upload da imagem.')
  }
  
  // Obter URL pública
  const { data: urlData } = db.storage
    .from(bucket)
    .getPublicUrl(filePath)
  
  return {
    success: true,
    fileName: fileName,
    publicUrl: urlData.publicUrl,
    path: filePath
  }
}

export async function uploadPDF(file, bucket = 'pdfs') {
  const db = await initSupabase()

  const { data: authData } = await db.auth.getUser()
  if (!authData?.user) {
    throw new Error('Voce precisa estar logado para enviar PDFs.')
  }
  
  const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`
  
  const { data, error } = await db.storage
    .from(bucket)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || 'application/pdf'
    })
  
  if (error) {
    console.error('Erro ao fazer upload de PDF:', error.message, error)
    throw new Error(error.message || 'Falha no upload do PDF.')
  }
  
  // Obter URL pública
  const { data: urlData } = db.storage
    .from(bucket)
    .getPublicUrl(fileName)
  
  return {
    success: true,
    fileName: fileName,
    publicUrl: urlData.publicUrl
  }
}

export async function deleteFile(filePath, bucket = 'images') {
  const db = await initSupabase()
  
  const { error } = await db.storage
    .from(bucket)
    .remove([filePath])
  
  if (error) {
    console.warn(`Erro ao deletar arquivo ${filePath}:`, error)
    return { success: false }
  }
  
  return { success: true }
}

export async function getStorageUrl(bucket, filePath) {
  const db = await initSupabase()
  
  const { data } = db.storage
    .from(bucket)
    .getPublicUrl(filePath)
  
  return data.publicUrl
}

// =====================================================
// HELPER PARA EXTRAIR STORAGE PATH DA URL
// =====================================================

export function extractStoragePath(url) {
  try {
    const urlObj = new URL(url)
    const parts = urlObj.pathname.split('/storage/v1/object/public/')
    if (parts[1]) {
      const [bucket, ...pathParts] = parts[1].split('/')
      return {
        bucket,
        path: pathParts.join('/')
      }
    }
  } catch (e) {
    console.warn('Erro ao extrair storage path:', e)
  }
  return null
}
