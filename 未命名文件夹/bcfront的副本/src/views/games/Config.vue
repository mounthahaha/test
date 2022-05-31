<template>
  <div class="games-config">
    <v-toolbar elevation="1" class="pl-2">
      <v-icon class="mr-2"> payment </v-icon>
      <v-toolbar-title>{{ $t(`sidebar_${$route.name}`) }}</v-toolbar-title>
      <v-spacer></v-spacer>
    </v-toolbar>
    <game-type-setting />
    <game-setting />
  </div>
</template>

<script>
import GameSetting from './components/GameConfig/GameSetting.vue'
import GameTypeSetting from './components/GameConfig/GameTypeSetting.vue'

export default {
  components: {
    GameSetting,
    GameTypeSetting
  },
  name: 'GamesConfig'
}
</script>