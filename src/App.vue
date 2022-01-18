<script setup>
import { computed, ref } from 'vue'
import { setupNewFile } from './features/useFileSystem'

const hasSaveFile = ref(false)
const newShow = ref('')
const newShowStatus = ref('watching')

const animeShows = ref([])

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
  console.log(file)
  // hasSaveFile.value = true
}

const addShow = () => {
  animeShows.value.push({
    show: newShow.value,
    status: newShowStatus.value
  })
  newShow.value = ''
  newShowStatus.value = 'watching'
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
        <li v-for="show in watchedShows">
          {{ show }}
        </li>
      </section>
    </article>
    <article v-else>
      <h2>Configure save file</h2>
      <button @click="addSaveFile">Add save file</button>
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
