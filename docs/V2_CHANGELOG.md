# Virtual Companion 3D — V2

Cambios:
- Persistencia local por dispositivo sin registro/login obligatorio.
- Sincronización Base44 opcional mediante `anonymous_device_id`.
- Merge profundo de vestuario para evitar perder valores por defecto.
- Prioridad de color: color específico de prenda > color de apariencia.
- Restauración segura de materiales al cambiar colores repetidamente.
- GLTFExporter incluye las animaciones del GLB al exportar.
- El visor limpia el estado `pending` cuando un modelo carga correctamente.

Nota: el proyecto sigue necesitando un `public/models/companion.glb` definitivo para probar las capacidades reales del personaje. Three.js soporta GLB/glTF, skins, morph targets y animaciones mediante GLTFLoader/GLTFExporter.
