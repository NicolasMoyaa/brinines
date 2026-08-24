/*******************************************************
 * MEMORIA DE CLIENTES
 *******************************************************/

function buscarCliente(identificador, plataforma) {
  if (!identificador) return null;
  const clientes = leerTabla(BRININES.sheets.clientes);
  const buscado = String(identificador).trim().toLowerCase();
  return clientes.find(cliente => {
    const campos = [cliente.Cliente_ID, cliente.Telefono, cliente.Instagram, cliente.TikTok, cliente.Facebook, cliente.WhatsApp, cliente.Nombre];
    return campos.some(valor => valor && String(valor).trim().toLowerCase() === buscado);
  }) || null;
}

function normalizarZona(zona) {
  if (!zona) return "";
  const texto = String(zona).trim().toUpperCase();
  if (texto.includes("FUERA")) return "FUERA_CENTRO";
  if (texto.includes("CENTRO")) return "CENTRO";
  return "";
}

function crearCliente(datos) {
  const sheet = getSheet(BRININES.sheets.clientes);
  const id = generarId("CLI");
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const fila = headers.map(header => {
    switch (header) {
      case "Cliente_ID": return id;
      case "Nombre": return datos.nombre || "";
      case "Telefono": return datos.telefono || "";
      case "Instagram": return datos.instagram || "";
      case "TikTok": return datos.tiktok || "";
      case "Facebook": return datos.facebook || "";
      case "WhatsApp": return datos.whatsapp || "";
      case "Zona":
      case "Zona_Cliente": return normalizarZona(datos.zona);
      case "Fecha_Alta": return ahora();
      case "Ultima_Interaccion": return ahora();
      case "Cantidad_Pedidos": return 0;
      case "Total_Gastado": return 0;
      case "Nivel_Familiaridad": return "NUEVO";
      case "Estado_Confianza": return "STANDARD";
      case "Hielo_Roto_Por_Cliente": return "NO";
      case "Hielo_Roto_Por_Brinines": return "NO";
      case "Estilo_Comunicacion": return "SIN_DATOS";
      case "Tono_Recomendado": return "CORDIAL";
      default: return "";
    }
  });
  sheet.appendRow(fila);
  return buscarCliente(id);
}

function actualizarCliente(clienteId, analisis) {
  const sheet = getSheet(BRININES.sheets.clientes);
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return;
  const headers = values[0];
  const idCol = headers.indexOf("Cliente_ID");
  if (idCol === -1) return;
  const rowIndex = values.findIndex((row, index) => index > 0 && String(row[idCol]) === String(clienteId));
  if (rowIndex === -1) return;
  const rowNumber = rowIndex + 1;
  const updates = {
    "Estado_Confianza": analisis.nivel_confianza || "",
    "Nivel_Familiaridad": analisis.nivel_confianza || "",
    "Estilo_Comunicacion": analisis.estilo_detectado || "",
    "Directo_Score": analisis.directo_score || 0,
    "Cordialidad_Score": analisis.cordialidad_score || 0,
    "Informalidad_Score": analisis.informalidad_score || 0,
    "Humor_Score": analisis.humor_score || 0,
    "Necesita_Guia_Score": analisis.necesita_guia_score || 0,
    "Preferencia_Longitud": analisis.preferencia_longitud || "",
    "Preferencia_Emojis": analisis.preferencia_emojis || "",
    "Tono_Recomendado": analisis.tono_recomendado || "",
    "Ultima_Interaccion": ahora()
  };
  Object.keys(updates).forEach(campo => {
    const columna = headers.indexOf(campo);
    if (columna !== -1) sheet.getRange(rowNumber, columna + 1).setValue(updates[campo]);
  });
  if (analisis.hielo_roto_por_cliente) {
    const columna = headers.indexOf("Hielo_Roto_Por_Cliente");
    if (columna !== -1) sheet.getRange(rowNumber, columna + 1).setValue("SI");
  }
  if (analisis.hielo_roto_por_brinines) {
    const columna = headers.indexOf("Hielo_Roto_Por_Brinines");
    if (columna !== -1) sheet.getRange(rowNumber, columna + 1).setValue("SI");
  }
}

function obtenerHistorialCliente(clienteId) {
  const conversaciones = leerTabla(BRININES.sheets.conversaciones).filter(conv => String(conv.Cliente_ID) === String(clienteId));
  const pedidos = leerTabla(BRININES.sheets.pedidos).filter(ped => String(ped.Cliente_ID || "") === String(clienteId));
  return { conversaciones: conversaciones.slice(-30), pedidos: pedidos.slice(-20) };
}

function construirContextoCliente(cliente) {
  if (!cliente) return { existe: false };
  const historial = obtenerHistorialCliente(cliente.Cliente_ID);
  return {
    existe: true,
    cliente: {
      id: cliente.Cliente_ID,
      nombre: cliente.Nombre,
      cantidad_pedidos: cliente.Cantidad_Pedidos,
      total_gastado: cliente.Total_Gastado,
      producto_favorito: cliente.Producto_Favorito,
      nivel_familiaridad: cliente.Nivel_Familiaridad,
      estado_confianza: cliente.Estado_Confianza,
      hielo_roto_por_cliente: cliente.Hielo_Roto_Por_Cliente,
      hielo_roto_por_brinines: cliente.Hielo_Roto_Por_Brinines,
      estilo: cliente.Estilo_Comunicacion,
      tono_recomendado: cliente.Tono_Recomendado
    },
    historial: historial
  };
}
