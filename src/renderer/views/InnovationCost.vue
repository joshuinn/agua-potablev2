<template>
    <div class="container mx-auto p-4">
      <table class="min-w-full border">
        <thead>
          <tr class="bg-gray-100">
            <th class="border p-2">N°</th>
            <th class="border p-2">Concepto</th>
            <th class="border p-2">Unidad</th>
            <th class="border p-2">Precio Unitario (MXN)</th>
            <th class="border p-2">Cantidad</th>
            <th class="border p-2">Total (MXN)</th>
            <th class="border p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, index) in items"
            :key="index"
            class="hover:bg-gray-50"
          >
            <td class="border p-2">
              <input
                v-if="editingIndex === index"
                v-model="item.numero"
                type="number"
                class="w-full p-1"
              />
              <span v-else>{{ item.numero }}</span>
            </td>
            <td class="border p-2">
              <input
                v-if="editingIndex === index"
                v-model="item.concepto"
                class="w-full p-1"
              />
              <span v-else>{{ item.concepto }}</span>
            </td>
            <td class="border p-2">
              <input
                v-if="editingIndex === index"
                v-model="item.unidad"
                class="w-full p-1"
              />
              <span v-else>{{ item.unidad }}</span>
            </td>
            <td class="border p-2">
              <input
                v-if="editingIndex === index"
                v-model="item.precioUnitario"
                type="number"
                class="w-full p-1"
              />
              <span v-else>${{ formatNumber(item.precioUnitario) }}</span>
            </td>
            <td class="border p-2">
              <input
                v-if="editingIndex === index"
                v-model="item.cantidad"
                type="number"
                class="w-full p-1"
              />
              <span v-else>{{ item.cantidad }}</span>
            </td>
            <td class="border p-2">${{ formatNumber(calculateTotal(item)) }}</td>
            <td class="border p-2">
              <button
                v-if="editingIndex === index"
                @click="saveEdit(index)"
                class="bg-green-500 text-white px-2 py-1 rounded mr-2"
              >
                Guardar
              </button>
              <button
                v-else
                @click="startEdit(index)"
                class="bg-blue-500 text-white px-2 py-1 rounded  w-full mb-2"
              >
                Editar
              </button>
              <button
                @click="deleteRow(index)"
                class="bg-red-500 text-white px-2 py-1 rounded w-full"
              >
                Eliminar
              </button>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="bg-gray-100 font-bold">
            <td colspan="5" class="border p-2 text-right">
              SUBTOTAL COSTO DE INNOVACIÓN:
            </td>
            <td class="border p-2">${{ formatNumber(subtotal) }}</td>
            <td class="border p-2"></td>
          </tr>
          <tr class="bg-gray-100 font-bold">
            <td colspan="5" class="border p-2 text-right">
              COSTOS INDIRECTOS (25%):
            </td>
            <td class="border p-2">${{ formatNumber(costosIndirectos) }}</td>
            <td class="border p-2"></td>
          </tr>
          <tr class="bg-gray-100 font-bold">
            <td colspan="5" class="border p-2 text-right">IVA (16%):</td>
            <td class="border p-2">${{ formatNumber(iva) }}</td>
            <td class="border p-2"></td>
          </tr>
          <tr class="bg-gray-100 font-bold">
            <td colspan="5" class="border p-2 text-right">
              COSTO TOTAL DE INNOVACIÓN:
            </td>
            <td class="border p-2">${{ formatNumber(total) }}</td>
            <td class="border p-2"></td>
          </tr>
        </tfoot>
      </table>
  
      <button
        @click="addRow"
        class="mt-4 bg-green-500 text-white px-4 py-2 rounded"
      >
        Agregar Fila
      </button>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        editingIndex: -1,
        items: [
          {
            numero: 1,
            concepto:
              "Diseño e ingeniería del sistema de autolimpieza para 100 manzanas",
            unidad: "Proyecto",
            precioUnitario: 90000,
            cantidad: 1,
          },
          {
            numero: 2,
            concepto: "Fabricación de tubería principal de doble pared (10 km)",
            unidad: "m",
            precioUnitario: 216,
            cantidad: 8500,
          },
          {
            numero: 3,
            concepto: "Fabricación de tubería secundaria de doble pared (50 km)",
            unidad: "m",
            precioUnitario: 180,
            cantidad: 15000,
          },
          {
            numero: 4,
            concepto:
              "Revestimiento interno especial (antiadherente y antibacteriano)",
            unidad: "m",
            precioUnitario: 540,
            cantidad: 650,
          },
          {
            numero: 5,
            concepto:
              "Sistema de generación de turbulencia (boquillas o difusores integrados cada 20 m)",
            unidad: "unidad",
            precioUnitario: 3600,
            cantidad: 150,
          },
          {
            numero: 6,
            concepto: "Sensores de flujo y calidad del agua (ubicados cada km)",
            unidad: "unidad",
            precioUnitario: 2700,
            cantidad: 60,
          },
          {
            numero: 7,
            concepto:
              "Sistema de limpieza automatizada (inyección de agua a presión y aire comprimido)",
            unidad: "unidad",
            precioUnitario: 27000,
            cantidad: 10,
          },
          {
            numero: 8,
            concepto:
              "Instalación de tuberías y equipos de limpieza (troncal y secundaria)",
            unidad: "m",
            precioUnitario: 850,
            cantidad: 300,
          },
          {
            numero: 9,
            concepto:
              "Sistema de control automatizado (PLC y software para gestión de limpieza y monitoreo)",
            unidad: "unidad",
            precioUnitario: 90000,
            cantidad: 1,
          },
          {
            numero: 10,
            concepto: "Pruebas y puesta en marcha del sistema completo",
            unidad: "Proyecto",
            precioUnitario: 54000,
            cantidad: 1,
          },
          {
            numero: 11,
            concepto: "Capacitación en operación y mantenimiento del sistema",
            unidad: "Proyecto",
            precioUnitario: 36000,
            cantidad: 1,
          },
          {
            numero: 12,
            concepto: "Contingencias (10% del costo total del proyecto)",
            unidad: "Proyecto",
            precioUnitario: 0,
            cantidad: 1,
          },
        ],
      };
    },
    computed: {
      subtotal() {
        return this.items.reduce(
          (sum, item) => sum + this.calculateTotal(item),
          0
        );
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
      formatNumber(number) {
        return number.toLocaleString("es-MX", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      },
      calculateTotal(item) {
        return item.precioUnitario * item.cantidad;
      },
      startEdit(index) {
        this.editingIndex = index;
      },
      saveEdit(index) {
        this.editingIndex = -1;
      },
      deleteRow(index) {
        if (confirm("¿Estás seguro de eliminar esta fila?")) {
          this.items.splice(index, 1);
        }
      },
      addRow() {
        this.items.push({
          numero: this.items.length + 1,
          concepto: "",
          unidad: "",
          precioUnitario: 0,
          cantidad: 0,
        });
      },
    },
  };
  </script>
  
  <style scoped>
  input {
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  </style>
  