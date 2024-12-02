<template>
  <div class="container mx-auto p-6">
    <h1 class="text-2xl font-bold mb-6 text-center">
      Análisis de Costos Climatológicos
    </h1>

    <!-- Botón para agregar nueva fila -->
    <div class="mb-4">
      <button
        @click="showAddModal = true"
        class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        Agregar Nueva Fila
      </button>
    </div>

    <!-- Tabla Principal -->
    <div class="bg-white shadow-lg rounded-lg overflow-hidden mb-6">
      <table class="min-w-full">
        <thead>
          <tr class="bg-gray-100">
            <th class="px-4 py-2 text-left">Concepto</th>
            <th class="px-4 py-2 text-center">Unidad</th>
            <th class="px-4 py-2 text-right">Precio Unitario (MXN)</th>
            <th class="px-4 py-2 text-center">Cantidad</th>
            <th class="px-4 py-2 text-right">Total (MXN)</th>
            <th class="px-4 py-2 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <template
            v-for="(category, categoryName) in groupedItems"
            :key="categoryName"
          >
            <tr class="bg-gray-50">
              <td colspan="6" class="px-4 py-2 font-bold">
                {{ categoryName }}
              </td>
            </tr>
            <tr v-for="item in category" :key="item.id" class="border-b">
              <template v-if="editingItem && editingItem.id === item.id">
                <!-- Modo edición -->
                <td class="px-4 py-2">
                  <input
                    v-model="editingItem.concepto"
                    class="w-full border rounded px-2 py-1"
                  />
                </td>
                <td class="px-4 py-2">
                  <input
                    v-model="editingItem.unidad"
                    class="w-full border rounded px-2 py-1 text-center"
                  />
                </td>
                <td class="px-4 py-2">
                  <input
                    type="number"
                    v-model.number="editingItem.precioUnitario"
                    class="w-full border rounded px-2 py-1 text-right"
                  />
                </td>
                <td class="px-4 py-2">
                  <input
                    type="number"
                    v-model.number="editingItem.cantidad"
                    class="w-full border rounded px-2 py-1 text-center"
                  />
                </td>
                <td class="px-4 py-2 text-right">
                  {{
                    formatCurrency(
                      editingItem.precioUnitario * (editingItem.cantidad || 0)
                    )
                  }}
                </td>
                <td class="px-4 py-2 text-center">
                  <button
                    @click="saveEdit"
                    class="bg-green-500 text-white px-2 py-1 rounded mr-2"
                  >
                    Guardar
                  </button>
                  <button
                    @click="cancelEdit"
                    class="bg-gray-500 text-white px-2 py-1 rounded"
                  >
                    Cancelar
                  </button>
                </td>
              </template>
              <template v-else>
                <!-- Modo visualización -->
                <td class="px-4 py-2">{{ item.concepto }}</td>
                <td class="px-4 py-2 text-center">{{ item.unidad }}</td>
                <td class="px-4 py-2 text-right">
                  {{ formatCurrency(item.precioUnitario) }}
                </td>
                <td class="px-4 py-2 text-center">
                  <input
                    type="number"
                    v-model.number="item.cantidad"
                    class="w-20 text-center border rounded p-1"
                    min="0"
                  />
                </td>
                <td class="px-4 py-2 text-right">
                  {{
                    formatCurrency(item.precioUnitario * (item.cantidad || 0))
                  }}
                </td>
                <td class="px-4 py-2 text-center">
                  <button
                    @click="startEdit(item)"
                    class="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                  >
                    Editar
                  </button>
                  <button
                    @click="deleteItem(item)"
                    class="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Eliminar
                  </button>
                </td>
              </template>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- Modal para agregar nueva fila -->
    <div
      v-if="showAddModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
    >
      <div class="bg-white p-6 rounded-lg w-96">
        <h2 class="text-xl font-bold mb-4">Agregar Nueva Fila</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Categoría</label>
            <select
              v-model="newItem.categoria"
              class="w-full border rounded px-2 py-1"
            >
              <option
                v-for="category in categories"
                :key="category"
                :value="category"
              >
                {{ category }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Concepto</label>
            <input
              v-model="newItem.concepto"
              class="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Unidad</label>
            <input
              v-model="newItem.unidad"
              class="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1"
              >Precio Unitario</label
            >
            <input
              type="number"
              v-model.number="newItem.precioUnitario"
              class="w-full border rounded px-2 py-1"
            />
          </div>
          <div class="flex justify-end space-x-2">
            <button
              @click="addItem"
              class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Guardar
            </button>
            <button
              @click="showAddModal = false"
              class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Resumen de Costos -->
    <div class="bg-white shadow-lg rounded-lg p-6">
      <h2 class="text-xl font-bold mb-4">Resumen de Costos</h2>
      <div class="space-y-2">
        <div
          v-for="category in categories"
          :key="category"
          class="flex justify-between"
        >
          <span>{{ category }}:</span>
          <span>{{ formatCurrency(categoryTotal(category)) }}</span>
        </div>
        <div class="flex justify-between font-bold border-t pt-2">
          <span>SUBTOTAL:</span>
          <span>{{ formatCurrency(subtotal) }}</span>
        </div>
        <div class="flex justify-between">
          <span>COSTOS INDIRECTOS (25%):</span>
          <span>{{ formatCurrency(costosIndirectos) }}</span>
        </div>
        <div class="flex justify-between">
          <span>IVA (16%):</span>
          <span>{{ formatCurrency(iva) }}</span>
        </div>
        <div class="flex justify-between font-bold border-t pt-2">
          <span>COSTO TOTAL:</span>
          <span>{{ formatCurrency(total) }}</span>
        </div>
      </div>
    </div>

    <!-- Botón de impresión -->
    <div class="mt-6 text-center">
      <button
        @click="generatePDF"
        class="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
      >
        Imprimir PDF
      </button>
    </div>
  </div>
</template>

<script>
import jsPDF from "jspdf";
import "jspdf-autotable";

export default {
  name: "ClimateTable",
  data() {
    return {
      items: [
        {
          id: 1,
          categoria: "SISMO",
          concepto: "Diseño estructural y geotécnico especializado",
          unidad: "Proyecto",
          precioUnitario: 150000,
          cantidad: 0,
        },
        {
          id: 2,
          categoria: "SISMO",
          concepto: "Tuberías de polietileno de alta densidad (PEAD)",
          unidad: "m",
          precioUnitario: 1200,
          cantidad: 0,
        },
        {
          id: 3,
          categoria: "SISMO",
          concepto: "Revestimiento externo anticorrosivo para tuberías",
          unidad: "m",
          precioUnitario: 180,
          cantidad: 0,
        },
        {
          id: 4,
          categoria: "SISMO",
          concepto: "Juntas flexibles resistentes a sismos",
          unidad: "unidad",
          precioUnitario: 450,
          cantidad: 0,
        },
        {
          id: 5,
          categoria: "HUMEDAD",
          concepto: "Cámaras de inspección y válvulas con sellado especial",
          unidad: "unidad",
          precioUnitario: 1500,
          cantidad: 0,
        },
        {
          id: 6,
          categoria: "LLUVIA",
          concepto: "Drenaje pluvial integrado en cámaras de inspección",
          unidad: "unidad",
          precioUnitario: 600,
          cantidad: 0,
        },
        {
          id: 7,
          categoria: "ASENTAMIENTOS",
          concepto: "Sistema de protección sísmica en válvulas",
          unidad: "unidad",
          precioUnitario: 1200,
          cantidad: 0,
        },
        {
          id: 8,
          categoria: "ASENTAMIENTOS",
          concepto: "Colocación de lecho de arena y geotextil",
          unidad: "m",
          precioUnitario: 250,
          cantidad: 0,
        },
        {
          id: 9,
          categoria: "ASENTAMIENTOS",
          concepto: "Aditivos estabilizantes para el suelo",
          unidad: "m³",
          precioUnitario: 150,
          cantidad: 0,
        },
        {
          id: 10,
          categoria: "ALTAS TEMPERATURAS",
          concepto: "Tuberías con doble recubrimiento térmico",
          unidad: "m",
          precioUnitario: 150,
          cantidad: 0,
        },
        {
          id: 11,
          categoria: "ALTAS TEMPERATURAS",
          concepto: "Sistema de drenaje especial",
          unidad: "unidad",
          precioUnitario: 2500,
          cantidad: 0,
        },
        {
          id: 12,
          categoria: "ALTAS TEMPERATURAS",
          concepto: "Protección catódica contra corrosión",
          unidad: "m",
          precioUnitario: 900,
          cantidad: 0,
        },
        {
          id: 13,
          categoria: "ALTAS TEMPERATURAS",
          concepto: "Pruebas de resistencia sísmica",
          unidad: "Proyecto",
          precioUnitario: 500000,
          cantidad: 0,
        },
        {
          id: 14,
          categoria: "ALTAS TEMPERATURAS",
          concepto: "Supervisión técnica especializada",
          unidad: "Proyecto",
          precioUnitario: 800000,
          cantidad: 0,
        },
        {
          id: 15,
          categoria: "ALTAS TEMPERATURAS",
          concepto: "Capacitación en mantenimiento",
          unidad: "Proyecto",
          precioUnitario: 200000,
          cantidad: 0,
        },
        {
          id: 16,
          categoria: "ALTAS TEMPERATURAS",
          concepto: "Contingencias (10%)",
          unidad: "Proyecto",
          precioUnitario: 260000,
          cantidad: 0,
        },
      ],
      editingItem: null,
      showAddModal: false,
      newItem: {
        categoria: "",
        concepto: "",
        unidad: "",
        precioUnitario: 0,
        cantidad: 0,
      },
      categories: [
        "SISMO",
        "HUMEDAD",
        "LLUVIA",
        "ASENTAMIENTOS",
        "ALTAS TEMPERATURAS",
      ],
    };
  },
  computed: {
    groupedItems() {
      return this.items.reduce((acc, item) => {
        if (!acc[item.categoria]) {
          acc[item.categoria] = [];
        }
        acc[item.categoria].push(item);
        return acc;
      }, {});
    },
    subtotal() {
      return this.items.reduce((sum, item) => {
        return sum + item.precioUnitario * (item.cantidad || 0);
      }, 0);
    },
    costosIndirectos() {
      return this.subtotal * 0.25;
    },
    iva() {
      return (this.subtotal + this.costosIndirectos) * 0.16;
    },
    total() {
      return this.subtotal + this.costosIndirectos + this.iva;
    },
  },
  methods: {
    formatCurrency(value) {
      return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
      }).format(value);
    },
    categoryTotal(category) {
      return this.items
        .filter((item) => item.categoria === category)
        .reduce(
          (sum, item) => sum + item.precioUnitario * (item.cantidad || 0),
          0
        );
    },
    generatePDF() {
      const doc = new jsPDF();

      doc.setFontSize(16);
      doc.text("Análisis de Costos Climatológicos", 14, 20);

      const tableData = this.items.map((item) => [
        item.concepto,
        item.unidad,
        this.formatCurrency(item.precioUnitario),
        item.cantidad || 0,
        this.formatCurrency(item.precioUnitario * (item.cantidad || 0)),
      ]);

      doc.autoTable({
        startY: 30,
        head: [["Concepto", "Unidad", "Precio Unitario", "Cantidad", "Total"]],
        body: tableData,
        theme: "grid",
      });

      const finalY = doc.lastAutoTable.finalY + 20;
      doc.setFontSize(12);

      // Agregar resumen por categoría
      let currentY = finalY;
      this.categories.forEach((category) => {
        doc.text(
          `${category}: ${this.formatCurrency(this.categoryTotal(category))}`,
          14,
          currentY
        );
        currentY += 10;
      });

      // Agregar totales
      currentY += 10;
      doc.text(`Subtotal: ${this.formatCurrency(this.subtotal)}`, 14, currentY);
      doc.text(
        `Costos Indirectos: ${this.formatCurrency(this.costosIndirectos)}`,
        14,
        currentY + 10
      );
      doc.text(`IVA: ${this.formatCurrency(this.iva)}`, 14, currentY + 20);
      doc.text(`Total: ${this.formatCurrency(this.total)}`, 14, currentY + 30);

      doc.save("analisis-costos-climatologicos.pdf");
    },
    startEdit(item) {
      this.editingItem = { ...item };
    },
    saveEdit() {
      const index = this.items.findIndex(
        (item) => item.id === this.editingItem.id
      );
      this.items[index] = { ...this.editingItem };
      this.editingItem = null;
    },
    cancelEdit() {
      this.editingItem = null;
    },
    deleteItem(item) {
      if (confirm("¿Está seguro de eliminar este concepto?")) {
        this.items = this.items.filter((i) => i.id !== item.id);
      }
    },
    addItem() {
      const newId = Math.max(...this.items.map((item) => item.id)) + 1;
      this.items.push({
        id: newId,
        ...this.newItem,
      });
      this.showAddModal = false;
      this.newItem = {
        categoria: "",
        concepto: "",
        unidad: "",
        precioUnitario: 0,
        cantidad: 0,
      };
    },
  },
};
</script>
