<template>
  <div>
    <p>{{ message }}</p>
  </div>
</template>

<script>
export default {
  name: "Exit",
  data() {
    return {
      message: "Goodbye!",
    };
  },
  mounted() {
    // Llama a la función para cerrar la aplicación
    if (window.electronAPI && window.electronAPI.closeApp) {
      console.log("Closing app...");
      
      window.electronAPI.closeApp();
    }else{
      console.log("No electronAPI found");
    }
  },
};
</script>
