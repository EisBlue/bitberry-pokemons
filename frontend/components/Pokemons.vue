<template>
<div class="upper-container">
<h1>Pokemons</h1>
  <div class="pokemons-container">
    <div v-for="pokemon in pokemons" :key="pokemon.id">
      <Pokemon :pokemon="pokemon" />
    </div>
  </div>
</div>
</template>

<script>
import Pokemon from "./Pokemon.vue";
export default {
  components: { Pokemon },
  data() {
    return {
      pokemons: null,
    };
  },
  async fetch() {
    this.pokemons = await fetch("http://localhost:5050/pokemon").then((res) => {
      return res.json();
    });
  },
};
</script>

<style>
.pokemons-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  flex-direction: row;
  gap: 20px;
}

.upper-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
}


</style>
