<template>
  <div class="container mx-auto p-4">
    <!-- Barra de búsqueda y botones -->
    <div class="mb-4 flex gap-4">
      <div class="flex-1">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Buscar por ID o palabra clave..."
          class="w-full p-2 border rounded"
        />
      </div>
      <button
        @click="toggleSelectAll"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        {{ allSelected ? "Deseleccionar todo" : "Seleccionar todo" }}
      </button>
      <button
        @click="downloadSelected"
        class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        :disabled="selectedItems.length === 0"
      >
        Descargar seleccionados
      </button>
    </div>

    <!-- Tabla -->
    <div class="overflow-x-auto">
      <table class="min-w-full border-collapse border">
        <thead>
          <tr class="bg-gray-100">
            <th class="border p-2">Elegir</th>
            <th class="border p-2">No. (ID)</th>
            <th class="border p-2">Concepto</th>
            <th class="border p-2">Unidad</th>
            <th class="border p-2">Cantidad de obra</th>
            <th class="border p-2">Precio unitario</th>
            <th class="border p-2">Subtotal</th>
            <th class="border p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredConcepts" :key="item.id">
            <td class="border p-2 text-center">
              <input
                type="checkbox"
                v-model="selectedItems"
                :value="item.id"
                class="h-4 w-4"
              />
            </td>
            <td class="border p-2">{{ item.id }}</td>
            <td class="border p-2">
              <template v-if="editingId === item.id">
                <input
                  v-model="editingItem.concept"
                  class="w-full p-1 border rounded"
                />
              </template>
              <template v-else>
                {{ item.concept }}
              </template>
            </td>
            <td class="border p-2">
              <template v-if="editingId === item.id">
                <input
                  v-model="editingItem.unit"
                  class="w-full p-1 border rounded"
                />
              </template>
              <template v-else>
                {{ item.unit }}
              </template>
            </td>
            <td class="border p-2">
              <input
                type="number"
                v-model.number="quantities[item.id]"
                min="1"
                class="w-20 p-1 border rounded"
              />
            </td>
            <td class="border p-2">
              <template v-if="editingId === item.id">
                <input
                  type="number"
                  v-model.number="editingItem.priceUnit"
                  min="0"
                  step="0.01"
                  class="w-24 p-1 border rounded"
                />
              </template>
              <template v-else> $ {{ formatNumber(item.priceUnit) }} </template>
            </td>
            <td class="border p-2">
              $ {{ formatNumber(item.priceUnit * quantities[item.id]) }}
            </td>
            <td class="border p-2">
              <template v-if="editingId === item.id">
                <div class="flex gap-2">
                  <button
                    @click="saveEdit"
                    class="bg-green-500 text-white px-2 py-1 rounded"
                  >
                    ✓
                  </button>
                  <button
                    @click="cancelEdit"
                    class="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    ✕
                  </button>
                </div>
              </template>
              <template v-else>
                <button
                  @click="startEdit(item)"
                  class="bg-blue-500 text-white px-3 py-1 rounded"
                >
                  Editar
                </button>
              </template>
            </td>
          </tr>
          <!-- Fila para agregar nuevo concepto -->
          <tr>
            <td class="border p-2"></td>
            <td class="border p-2">
              <input
                type="text"
                v-model="newItem.id"
                placeholder="ID"
                class="w-full p-1 border rounded"
              />
            </td>
            <td class="border p-2">
              <input
                v-model="newItem.concept"
                placeholder="Concepto"
                class="w-full p-1 border rounded"
              />
            </td>
            <td class="border p-2">
              <input
                v-model="newItem.unit"
                placeholder="Unidad"
                class="w-full p-1 border rounded"
              />
            </td>
            <td class="border p-2">
              <input
                type="number"
                value="1"
                disabled
                class="w-20 p-1 border rounded bg-gray-100"
              />
            </td>
            <td class="border p-2">
              <input
                type="number"
                v-model.number="newItem.priceUnit"
                min="0"
                step="0.01"
                placeholder="Precio"
                class="w-24 p-1 border rounded"
              />
            </td>
            <td class="border p-2">$ 0.00</td>
            <td class="border p-2">
              <button
                @click="addNewItem"
                class="bg-green-500 text-white px-3 py-1 rounded"
              >
                Agregar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Resumen de costos -->
    <div class="mt-4 w-64 ml-auto">
      <div class="border p-4 rounded bg-gray-50">
        <div class="flex justify-between mb-2">
          <span>Subtotal:</span>
          <span>$ {{ formatNumber(subtotal) }}</span>
        </div>
        <div class="flex justify-between mb-2">
          <span>Costo indirecto (20%):</span>
          <span>$ {{ formatNumber(indirectCost) }}</span>
        </div>
        <div class="flex justify-between mb-2">
          <span>IVA (16%):</span>
          <span>$ {{ formatNumber(iva) }}</span>
        </div>
        <div class="flex justify-between font-bold border-t pt-2">
          <span>Total:</span>
          <span>$ {{ formatNumber(total) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

import { catalogConcepts as data } from "../data/catalog-concepts";
// Estado

const catalogConcepts = ref([...data]);
const searchQuery = ref("");
const selectedItems = ref([]);
const quantities = ref({});
const editingId = ref(null);
const editingItem = ref({});
const newItem = ref({
  id: "",
  concept: "",
  unit: "",
  priceUnit: 0,
});

// Inicialización
onMounted(() => {
  catalogConcepts.value.forEach((item) => {
    quantities.value[item.id] = 1;
  });
});

// Computed properties
const filteredConcepts = computed(() => {
  const query = searchQuery.value.toLowerCase();
  return catalogConcepts.value.filter(
    (item) =>
      item.id.toString().includes(query) ||
      item.concept.toLowerCase().includes(query)
  );
});

const allSelected = computed(() => {
  return selectedItems.value.length === catalogConcepts.value.length;
});

const subtotal = computed(() => {
  return selectedItems.value.reduce((sum, id) => {
    const item = catalogConcepts.value.find((c) => c.id === id);
    return sum + item.priceUnit * quantities.value[id];
  }, 0);
});

const indirectCost = computed(() => subtotal.value * 0.2);
const iva = computed(() => (subtotal.value + indirectCost.value) * 0.16);
const total = computed(() => subtotal.value + indirectCost.value + iva.value);

// Métodos
const formatNumber = (number) => {
  return number.toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const toggleSelectAll = () => {
  if (allSelected.value) {
    selectedItems.value = [];
  } else {
    selectedItems.value = catalogConcepts.value.map((item) => item.id);
  }
};

const startEdit = (item) => {
  editingId.value = item.id;
  editingItem.value = { ...item };
};

const saveEdit = () => {
  const index = catalogConcepts.value.findIndex(
    (item) => item.id === editingId.value
  );
  if (index !== -1) {
    catalogConcepts.value[index] = { ...editingItem.value };
  }
  editingId.value = null;
};

const cancelEdit = () => {
  editingId.value = null;
};

const addNewItem = () => {
  if (
    !newItem.value.concept ||
    !newItem.value.unit ||
    !newItem.value.priceUnit
  ) {
    alert("Por favor complete todos los campos");
    return;
  }

  const newId = Math.max(...catalogConcepts.value.map((c) => c.id), 0) + 1;
  const itemToAdd = {
    ...newItem.value,
    id: newId,
    priceUnit: Number(newItem.value.priceUnit),
  };

  catalogConcepts.value.push(itemToAdd);
  quantities.value[newId] = 1;

  // Limpiar el formulario
  newItem.value = {
    id: "",
    concept: "",
    unit: "",
    priceUnit: 0,
  };
};

const downloadSelected = () => {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Elementos Seleccionados", 10, 10);

  const headers = [["ID", "Concepto", "Cantidad", "PU", "Subtotal"]];
  const data = selectedItems.value.map((id) => {
    const item = catalogConcepts.value.find((c) => c.id === id);
    const quantity = quantities.value[id];
    const subtotal = item.priceUnit * quantity;
    return [
      item.id,
      item.concept,
      quantity,
      `$${item.priceUnit.toFixed(2)}`,
      `$${subtotal.toFixed(2)}`,
    ];
  });

  doc.autoTable({
    head: headers,
    body: data,
    startY: 20,
  });

  doc.save("elementos_seleccionados.pdf");
};
</script>

<style scoped>
/* Aquí puedes agregar estilos específicos si los necesitas */
</style>
