import {
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from 'react-native'
import { Video, ResizeMode } from 'expo-av'
import Icon from '@expo/vector-icons/Feather'

import NLWLogo from '../src/assets/nlw-spacetime-logo.svg'
import { Link, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useState } from 'react'
import * as ImagePicker from 'expo-image-picker'
import * as SecureStore from 'expo-secure-store'
import { api } from '../src/lib/api'

export default function NewMemory() {
  const { bottom, top } = useSafeAreaInsets()
  const router = useRouter()

  const [preview, setPreview] = useState<string | null>(null)
  const [fileType, setFileType] = useState<string | null>(null)
  const [fileExtension, setFileExtension] = useState<string | null>(null)

  const [content, setContent] = useState('')
  const [isPublic, setIsPublic] = useState(false)

  const [showAlert, setShowAlert] = useState(false)
  const [textAlert, setTextAlert] = useState('')
  const [typeAlert, setTypeAlert] = useState('')

  async function openImagePicker() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        quality: 1,
      })
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0]

        const MAX_FILE_SIZE_BYTES = 5_242_880 // 5mb

        const response = await fetch(file.uri)
        const fileInfo = await response.blob()
        const fileSizeInBytes = fileInfo.size
        console.log(file.fileName, file.uri)
        if (fileSizeInBytes > MAX_FILE_SIZE_BYTES) {
          handleShowAlert(
            'O arquivo excede o tamanho máximo permitido de 5mb.',
            'error',
          )
          return
        }

        const mimeType = file.type
        console.log(`MIME type: ${mimeType}`)
        setFileType(mimeType.includes('video') ? 'video' : 'image')

        const filePath = file.uri
        const regex = /\.(\w+)$/ // Expressão regular para extrair a extensão do arquivo
        const match = filePath.match(regex)
        setFileExtension(match?.[1])

        setPreview(file.uri)
      }
    } catch (err) {
      const errorMessage = err.message
      handleShowAlert(errorMessage, 'error')
    }
  }

  async function handleCreateMemory() {
    const token = await SecureStore.getItemAsync('token')

    let coverUrl = ''

    const isValid = validateData(content, preview)
    if (!isValid) {
      handleShowAlert(
        'Por favor, preencha o campo de detalhes e anexe um arquivo.',
        'error',
      )
      return
    }

    if (preview) {
      const uploadFormData = new FormData()

      uploadFormData.append('file', {
        uri: preview,
        name: `file.${fileExtension}`,
        type: `${fileType}/${fileExtension}`,
      } as any)

      const uploadResponse = await api.post('/upload', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      })

      coverUrl = uploadResponse.data.fileUrl
    }

    await api.post(
      '/memories',
      {
        content,
        isPublic,
        coverUrl,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )
    handleShowAlert('Memória cadastrada com sucesso!', 'success')
  }

  function handleShowAlert(value: string, type: string) {
    setShowAlert(true)
    setTextAlert(value)
    setTypeAlert(type)
    setTimeout(() => {
      setShowAlert(false)
      if (type === 'success') {
        router.push('/memories')
      }
    }, 5000)
  }

  function handleDismissAlert() {
    setShowAlert(false)
  }

  function validateData(content: string, coverUrl: string): boolean {
    return !!content && !!coverUrl
  }

  return (
    <>
      <ScrollView
        className="flex-1 px-8"
        contentContainerStyle={{ paddingBottom: bottom, paddingTop: top }}
      >
        <View className="mt-4 flex-row items-center justify-between">
          <NLWLogo />

          <Link href="/memories" asChild>
            <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-full bg-purple-500">
              <Icon name="arrow-left" size={16} color="#fff" />
            </TouchableOpacity>
          </Link>
        </View>

        <View className="mt-6 space-y-6">
          <View className="flex-row items-center gap-2">
            <Switch
              value={isPublic}
              onValueChange={setIsPublic}
              trackColor={{ false: '#767577', true: '#372560' }}
              thumbColor={isPublic ? '#9b79ea' : '#9e9ea0'}
            />
            <Text className="font-body text-base text-gray-200">
              Tornar memória pública
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={openImagePicker}
            className="h-32 items-center justify-center rounded-lg border border-dashed border-gray-500 bg-black/20"
          >
            {preview ? (
              <>
                {fileType === 'image' ? (
                  <Image
                    source={{ uri: preview }}
                    className="h-full w-full rounded-lg object-cover"
                    alt=""
                  />
                ) : (
                  <Video
                    source={{
                      uri: preview,
                    }}
                    className="h-full w-full rounded-lg object-cover"
                    resizeMode={ResizeMode.COVER}
                  />
                )}
              </>
            ) : (
              <View className="flex-row items-center gap-2">
                <Icon name="image" color="#fff" />
                <Text className="text-sm font-bold text-gray-200">
                  Adicionar foto ou vídeo de capa
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TextInput
            multiline
            value={content}
            onChangeText={setContent}
            textAlignVertical="top"
            cursorColor="#9b79ea"
            className="p-0 font-body text-lg text-gray-50"
            placeholderTextColor="#56565a"
            placeholder="Fique livre para adicionar fotos, vídeos e relatos sobre essa experiência que você quer lembrar para sempre."
          />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleCreateMemory}
            className="items-center self-end rounded-full bg-green-500 px-5 py-2"
          >
            <Text className="font-alt text-sm uppercase text-black">
              Salvar
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <TouchableOpacity
        onPress={handleDismissAlert}
        className={`absolute bottom-10 left-1 right-1 mx-8 rounded bg-red-500 px-4 py-2 
        ${showAlert ? 'opacity-100' : 'opacity-0'} 
        ${showAlert ? '' : 'hidden'} 
        ${typeAlert === 'error' ? ' bg-red-500 ' : ' bg-green-600'}
        transition-all duration-300`}
      >
        <View className="flex flex-row items-start justify-between gap-2">
          <Text className="text-white">{textAlert}</Text>
          <Icon name="x" color="#fff" />
        </View>
      </TouchableOpacity>
    </>
  )
}
