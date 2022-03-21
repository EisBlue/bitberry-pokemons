<template>
  <div class="card" style="width: 18rem">
    <div class="card-body">
      <h5 class="card-title">{{ pokemon.name }}</h5>
      <p class="card-text">
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Minus quo
        tempore expedita, odit minima rem dolor ut consequatur blanditiis quos
        corrupti beatae, cumque sed natus delectus culpa explicabo nisi.
        Aliquid.
      </p>
      <NuxtLink class="link" :to="'pokemonDetails/' + pokemon.id"
        >More Details</NuxtLink>
    </div>
  </div>
</template>

<script>
export default {
  props: ["pokemon"],
  data() {
    return {
      abilities: null
    }
  },
  setup() {},

};
</script>

<style>
.card-body {
  background-color: rgba(232, 255, 203, 0.089);
}

.card{
  transition: 0.5s;
}
.card:hover {
  transition: 0.5s;
  transform: scale(1.02);
}

</style>
