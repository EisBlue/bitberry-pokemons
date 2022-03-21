<template>
  <div class="fluid-container">
    <Pokemons />
  </div>
</template>

<script>
import Pokemons from "../components/Pokemons.vue";
export default {
  components: { Pokemons },
  name: "IndexPage",
};
</script>

<style>
body{
  background-color: rgba(0, 0, 0, 0.034);
}
</style>
