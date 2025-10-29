<?php
// CONFIGURA ESTO:
$destinatario = "dorianmiguelfloresbonilla@gmail.com"; 
$redireccion_ok = "https://comparaalarmas.es/gracias.html"; // a dónde mandar después de enviar bien
$redireccion_error = "index.html#form-error"; // por si hay error

// =============== SEGURIDAD BÁSICA / VALIDEZ ===============

// Solo aceptar método POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header("Location: $redireccion_error");
    exit;
}

// Honeypot anti-bots: si el campo oculto "correo" viene relleno, abortamos
if (!empty($_POST['correo'])) {
    header("Location: $redireccion_ok"); // fingimos ok, pero no enviamos nada
    exit;
}

// Recogemos datos
$nombre   = isset($_POST['nombre'])   ? trim($_POST['nombre'])   : '';
$telefono = isset($_POST['telefono']) ? trim($_POST['telefono']) : '';
$ciudad   = isset($_POST['ciudad'])   ? trim($_POST['ciudad'])   : '';

// Validación mínima
if ($nombre === '' || $telefono === '' || $ciudad === '') {
    header("Location: $redireccion_error");
    exit;
}

// Pequeño saneo básico
$nombre   = strip_tags($nombre);
$telefono = strip_tags($telefono);
$ciudad   = strip_tags($ciudad);

// Montar el email
$asunto = "📞 Nuevo lead alarma";
$cuerpo = "Tienes una nueva solicitud de comparativa:\n\n"
        . "Nombre: $nombre\n"
        . "Teléfono: $telefono\n"
        . "Zona / Ciudad: $ciudad\n"
        . "Fecha/Hora: " . date('d-m-Y H:i:s') . "\n";

// Cabeceras del email
$cabeceras = "From: Aviso Web <no-reply@comparaalarmas.es>\r\n";
$cabeceras .= "Reply-To: $telefono\r\n"; // esto a veces no es email válido, no pasa nada
$cabeceras .= "Content-Type: text/plain; charset=UTF-8\r\n";

// Enviar
@mail($destinatario, $asunto, $cuerpo, $cabeceras);

// Redirigimos a página de gracias SIEMPRE, aunque falle el @mail,
// para que el usuario no vea error feo.
header("Location: $redireccion_ok");
exit;
?>
