<script setup>
import { computed, ref } from 'vue'
import { chooseFile, setupNewFile, writeFile } from './features/useFileSystem'

/**
 * Reactive Data
 */
const hasSaveFile = ref(false)
const newShow = ref('')
const newShowStatus = ref('watching')
const userFile = ref(undefined)

const animeShows = ref([])

/**
 * Computed Properties
 */
const currentlyWatchingShows = computed(() => {
  return animeShows.value.filter(show => show.status === 'watching')
})

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

const chooseSaveFile = async () => {
  userFile.value = await chooseFile()
  const file = await userFile.value.getFile()
  const fileContents = JSON.parse(await file.text())

  animeShows.value = fileContents
  hasSaveFile.value = true
}
</script>

<template>
  <main>
    <h1>Anime Show Tracker</h1>
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
            {{ show }}
          </li>
        </ul>
      </section>
      <section class="anime-list">
        <h2>Watched</h2>
        <ul>
          <li v-for="show in watchedShows">
            {{ show }}
          </li>
        </ul>
      </section>
    </article>
    <article v-else>
      <h2>Configure save file</h2>
      <button @click="addSaveFile" style="margin-right: 10px">
        Create save file
      </button>
      <button @click="chooseSaveFile">Use existing data</button>
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
</style>
