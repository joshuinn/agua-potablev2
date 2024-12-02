<template>
    <div class="container mx-auto p-4">
      <div class="mb-4">
        <button
          @click="exportToPDF"
          class="bg-blue-500 text-white px-4 py-2 rounded mr-2"
        >
          Exportar a PDF
        </button>
        <button @click="addRow" class="bg-green-500 text-white px-4 py-2 rounded">
          Agregar Fila
        </button>
      </div>
  
      <div id="content-to-pdf">
        <table class="min-w-full border">
          <thead>
            <tr class="bg-gray-100">
              <th class="border p-2">N°</th>
              <th class="border p-2">Concepto (Descripción completa)</th>
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
              <td class="border p-2">
                ${{ formatNumber(calculateTotal(item)) }}
              </td>
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
                  class="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                >
                  Editar
                </button>
                <button
                  @click="deleteRow(index)"
                  class="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="bg-gray-100 font-bold">
              <td colspan="5" class="border p-2 text-right">SUBTOTAL:</td>
              <td class="border p-2">${{ formatNumber(subtotal) }}</td>
              <td class="border p-2"></td>
            </tr>
            <tr class="bg-gray-100 font-bold">
              <td colspan="5" class="border p-2 text-right">IVA (16%):</td>
              <td class="border p-2">${{ formatNumber(iva) }}</td>
              <td class="border p-2"></td>
            </tr>
            <tr class="bg-gray-100 font-bold">
              <td colspan="5" class="border p-2 text-right">TOTAL:</td>
              <td class="border p-2">${{ formatNumber(total) }}</td>
              <td class="border p-2"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </template>
  <script>
  import jsPDF from "jspdf";
  import "jspdf-autotable";
  
  export default {
    data() {
      return {
        editingIndex: -1,
        items: [
          {
            numero: 1,
            concepto:
              "Supervisión técnica y administrativa (personal de ingeniería y supervisión)",
            unidad: "Mes",
            precioUnitario: 120000,
            cantidad: 1,
          },
          {
            numero: 2,
            concepto: "Oficina de campo (renta, equipos y operación)",
            unidad: "Mes",
            precioUnitario: 80000,
            cantidad: 1,
          },
          {
            numero: 3,
            concepto:
              "Gastos legales (permisos, licencias y trámites ante autoridades locales)",
            unidad: "Proyecto",
            precioUnitario: 500000,
            cantidad: 1,
          },
          {
            numero: 4,
            concepto:
              "Seguros del proyecto (responsabilidad civil, accidentes y daños a terceros)",
            unidad: "Proyecto",
            precioUnitario: 1200000,
            cantidad: 1,
          },
          {
            numero: 5,
            concepto:
              "Capacitación al personal (seguridad, calidad y mantenimiento)",
            unidad: "Proyecto",
            precioUnitario: 300000,
            cantidad: 1,
          },
          {
            numero: 6,
            concepto: "Transporte y movilización del personal",
            unidad: "Mes",
            precioUnitario: 50000,
            cantidad: 1,
          },
          {
            numero: 7,
            concepto: "Energía eléctrica y combustible para equipos y maquinaria",
            unidad: "Mes",
            precioUnitario: 70000,
            cantidad: 1,
          },
          {
            numero: 8,
            concepto:
              "Comunicaciones (telefonía, internet y software de gestión de obra)",
            unidad: "Mes",
            precioUnitario: 20000,
            cantidad: 1,
          },
          {
            numero: 9,
            concepto:
              "Control de calidad (pruebas de materiales y certificación de procesos)",
            unidad: "Proyecto",
            precioUnitario: 800000,
            cantidad: 1,
          },
          {
            numero: 10,
            concepto:
              "Contingencias para imprevistos en costos indirectos (10% del subtotal)",
            unidad: "Proyecto",
            precioUnitario: 654000,
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
      iva() {
        return this.subtotal * 0.16;
      },
      total() {
        return this.subtotal + this.iva;
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
          this.renumberItems();
        }
      },
      addRow() {
        this.items.push({
          numero: this.items.length + 1,
          concepto: "",
          unidad: "",
          precioUnitario: 0,
          cantidad: 1,
        });
      },
      renumberItems() {
        this.items.forEach((item, index) => {
          item.numero = index + 1;
        });
      },
      exportToPDF() {
        const doc = new jsPDF();
  
        // Título
        doc.setFontSize(16);
        doc.text("Presupuesto", 14, 20);
  
        // Preparar datos para la tabla
        const tableData = this.items.map((item) => [
          item.numero,
          item.concepto,
          item.unidad,
          `$${this.formatNumber(item.precioUnitario)}`,
          item.cantidad,
          `$${this.formatNumber(this.calculateTotal(item))}`,
        ]);
  
        // Agregar totales
        tableData.push(
          ["", "", "", "", "SUBTOTAL:", `$${this.formatNumber(this.subtotal)}`],
          ["", "", "", "", "IVA (16%):", `$${this.formatNumber(this.iva)}`],
          ["", "", "", "", "TOTAL:", `$${this.formatNumber(this.total)}`]
        );
  
        // Configuración de la tabla
        doc.autoTable({
          head: [
            ["N°", "Concepto", "Unidad", "Precio Unitario", "Cantidad", "Total"],
          ],
          body: tableData,
          startY: 30,
          styles: {
            fontSize: 8,
            cellPadding: 2,
          },
          columnStyles: {
            0: { cellWidth: 10 },
            1: { cellWidth: 80 },
            2: { cellWidth: 20 },
            3: { cellWidth: 25 },
            4: { cellWidth: 20 },
            5: { cellWidth: 25 },
          },
        });
  
        // Guardar el PDF
        doc.save("presupuesto.pdf");
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
  