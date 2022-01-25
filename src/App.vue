<script setup>
import { computed, ref, onMounted, effect } from 'vue'
import {
  chooseDirectory,
  chooseFile,
  setupNewFile,
  writeFile
} from './features/useFileSystem'
import { get, set } from 'https://unpkg.com/idb-keyval@5.0.2/dist/esm/index.js'

/**
 * Reactive Data
 */
const directoryFiles = ref([])
const hasSaveFile = ref(false)
const newShow = ref('')
const newShowStatus = ref('watching')
const userFile = ref(undefined)
const existingFile = ref(undefined)
const animeCover = ref(undefined)

const animeShows = ref([])
const animeImages = ref([])

/**
 * Computed Properties
 */
const animeCovers = computed(() => {
  return directoryFiles.value.filter(file => file.name.indexOf('.jpeg') > -1)
})

const currentlyWatchingShows = computed(() => {
  return animeShows.value.filter(show => show.status === 'watching')
})

const getFirstAnimeCover = async () => {
  if (animeCovers.value.length > 0) {
    const cover = await animeCovers.value[0].getFile()
    const coverUrl = URL.createObjectURL(cover)

    animeCover.value = coverUrl
  } else {
    animeCover.value = 'no image found'
  }
}

const watchedShows = computed(() => {
  return animeShows.value.filter(show => show.status === 'watched')
})

/**
 * Methods
 */
const addSaveFile = async () => {
  const file = await setupNewFile()
  if (file.status === 'success') {
    hasSaveFile.value = true
    userFile.value = file.fileHandle
  }
}

const addShow = async () => {
  // Update reactive data
  animeShows.value.push({
    show: newShow.value,
    status: newShowStatus.value
  })

  // Save data to the file
  await writeFile(userFile.value, JSON.stringify(animeShows.value))

  // Reset value
  newShow.value = ''
  newShowStatus.value = 'watching'
}

const chooseSaveDirectory = async () => {
  directoryFiles.value = await chooseDirectory()
  const saveFile = directoryFiles.value.find(file => {
    return file.name.indexOf('.json') > -1
  })
  const imageFileList = directoryFiles.value.filter(file => {
    return file.name.indexOf('.jpeg') > -1
  })

  if (saveFile) {
    hasSaveFile.value = true
    userFile.value = saveFile

    const file = await userFile.value.getFile()
    const fileContents = JSON.parse(await file.text())

    animeShows.value = fileContents
    hasSaveFile.value = true
  }

  if (imageFileList) {
    imageFileList.forEach(async file => {
      const existingShow = animeShows.value.findIndex(show => {
        return (
          show.show.toLowerCase().replace(/ /g, '-') ===
          file.name.replace('-cover.jpeg', '')
        )
      })

      if (existingShow > -1) {
        const fileContents = await file.getFile()
        const fileUrl = URL.createObjectURL(fileContents)
        animeShows.value[existingShow].cover = fileUrl
      }
    })
  }
}

const addCover = () => {
  animeShows.value[0].cover = 'test'
}

const chooseSaveFile = async () => {
  userFile.value = await chooseFile()
  await set('saveFile', userFile.value)
  const file = await userFile.value.getFile()
  const fileContents = JSON.parse(await file.text())

  animeShows.value = fileContents
  hasSaveFile.value = true
}

const useLastSession = async () => {
  userFile.value = existingFile.value

  const permission = await userFile.value.requestPermission({
    mode: 'readwrite'
  })

  if (permission === 'granted') {
    const file = await userFile.value.getFile()
    const fileContents = JSON.parse(await file.text())

    animeShows.value = fileContents
    hasSaveFile.value = true
  }
}

/**
 * Lifecycle Hooks
 */
onMounted(async () => {
  const localSaveFile = await get('saveFile')

  if (localSaveFile) {
    existingFile.value = localSaveFile
  }
})
</script>

<template>
  <main>
    <h1>Anime Show Tracker</h1>
    <button @click="addCover">Add Cover</button>
    <h2>ImageList: {{ animeImages }}</h2>
    <h2>Image: {{ animeCover }}</h2>
    <img v-if="animeCover" :src="animeCover" alt="" />
    <button @click="getFirstAnimeCover">Get Cover</button>
    <article v-if="hasSaveFile">
      <form @submit.prevent>
        <input type="text" placeholder="Show Name" v-model="newShow" />
        <select name="show-status" id="show-status" v-model="newShowStatus">
          <option value="watching" selected>Watching</option>
          <option value="watched">Watched</option>
        </select>
        <button @click="addShow">Add Show</button>
      </form>
      <section class="anime-list">
        <h2>Currently Watching</h2>
        <ul>
          <li v-for="show in currentlyWatchingShows">
            <img :src="show.cover" />
            {{ show.show }}
          </li>
        </ul>
      </section>
      <section class="anime-list">
        <h2>Watched</h2>
        <ul>
          <li v-for="show in watchedShows">
            <img :src="show.cover" />
            {{ show.show }}
          </li>
        </ul>
      </section>
    </article>
    <article v-else>
      <section style="border-bottom: 1px solid #222; padding-bottom: 30px">
        <h2>Configure directory</h2>
        <button @click="chooseSaveDirectory">
          Choose an existing directory
        </button>
      </section>
      <h2>Configure save file</h2>
      <div v-if="existingFile">
        <p>{{ existingFile.name }}</p>
        <button @click="useLastSession" style="margin-right: 10px">
          Use last session
        </button>
        <hr />
      </div>
      <button @click="addSaveFile" style="margin-right: 10px">
        Create save file
      </button>
      <button @click="chooseSaveFile">Choose an existing file</button>
    </article>
  </main>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  padding: 30px;
}

.anime-list {
  text-align: left;
}

.anime-list ul {
  list-style: none;
  margin-left: 0;
  padding-left: 0;
}

.anime-list li {
  display: flex;
  flex-direction: column;
  max-width: 100px;
  text-align: center;
}

.anime-list li img {
  margin-bottom: 10px;
}
</style>
