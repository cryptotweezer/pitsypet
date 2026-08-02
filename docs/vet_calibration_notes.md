# vet_calibration_notes.md — Calibración clínica con veterinaria (sesión en vivo)

**Qué es este archivo:** el registro crudo de la entrevista de calibración del protocolo
`docs/vet_protocol.md`. Guarda las respuestas de la veterinaria **en español y tal como las dio**,
antes de traducirlas a criterios de código. Es material irrepetible: primero se documenta acá,
después el desarrollador lo convierte en reglas (en inglés) sobre `classifier.ts`, `safety.ts`,
`fallback.ts`, el prompt de extracción y las tablas de recomendaciones.

---

## Datos de la sesión

- **Fecha:** 2026-08-02
- **Veterinaria:** anonimizada a propósito. Perfil profesional: 3 años de experiencia, perros y
  gatos, consulta general, urgencias y cirugía. La identidad no se registra en el repositorio
  (que es público) para no exponer datos personales de una profesional que colaboró de forma
  privada. Si en algún momento autoriza ser acreditada, se agrega aquí.
- **Ejerce en:** Colombia (con experiencia clínica; actualmente sin ejercicio activo)
- **Duración disponible:** 1 hora
- **Formato:** preguntas y respuestas una a la vez, por chat. Sin cambios de código durante la
  entrevista: primero se recopila todo, después el desarrollador aplica los ajustes.
- **Alcance excluido en esta sesión (se trabaja después con el desarrollador):** fuentes
  documentales para el RAG, contactos de emergencia reales, scripts de evaluación.

**Nota de contexto clínico:** la veterinaria ejerce en Colombia, así que los criterios de triage
(fisiología, umbrales, banderas rojas) son aplicables, pero la epidemiología específica de
Australia (garrapata paralizante, 1080, cebo de caracoles, sapo de caña, serpientes locales) y los
recursos de urgencia australianos **no** se validan con esta sesión y quedan pendientes.

---

## Registro de la entrevista

### M0 — Perfil profesional

**P1. Especies, años y ámbito.**
> Perros y gatos, 3 años, consulta general, urgencias y cirugía.

---

### M0 / M2 — Los tres niveles: definiciones, ventanas y ejemplos

**P2. ¿Qué define riesgo BAJO y cuánto margen de observación se da?**
> Riesgo bajo es que los síntomas sean muy leves y que igual esté comiendo, no deprimido ni
> letárgico, tomando agua, no vomitando ni diarrea, no sangrando, no accidentado; que en general
> el dueño lo vea bien, solo con algo de síntomas leves.
> Si la consulta es de noche: observar en la noche y, si sigue mal en la mañana, llevarlo al
> veterinario. Si es de día: ir observando **cada 2 horas** cómo se comporta y, si algo cambia
> drásticamente, llevarlo al veterinario.

**P3. ¿Qué define riesgo MEDIO y en qué plazo?**
> Debería llevarlo en las próximas horas, el mismo día o noche, dentro de un plazo de
> **6 a 12 horas**.

**P4. Ejemplos de riesgo MEDIO (ni casa, ni corra ya).**
> - Heces blandas, pero sigue animado, comiendo, tomando agua, no vomitando.
> - El dueño se dio cuenta de que se comió algo (de consumo humano o un objeto pequeño) pero el
>   animal sigue bien: comiendo, tomando agua, heces normales, animado, no vomitando.
> - El animal está un poco decaído pero come bien y no tiene ningún otro síntoma.
> - El perro sufrió un pequeño golpe que no afectó ninguna parte vital, no sangra, pero está un
>   poco decaído y de resto come bien y hace todas sus funciones normales.

**P5. ¿Qué define riesgo ALTO?**
> El animal se accidentó, sangra, está letárgico, decaído, no come, vomita, diarrea líquida de
> diferentes tipos, se comió algo tóxico, se comió un objeto muy grande, sufrió golpe de calor,
> sufrió algún episodio de violencia humana o un ataque de otro animal.

**P6. Vómito único, animal por lo demás perfecto.**
> Medio.

**P7. Ejemplos concretos de riesgo BAJO (observar en casa).**
> - Se está rascando o lamiendo y no tiene una lesión de piel alarmante: debe revisarlo y tratar
>   de **programar visita al veterinario en los próximos días**.
> - Tiene una masa en piel que no está inflamada, ni ulcerada, ni duele, se mueve al tacto y no ha
>   crecido en meses: debe **programar un control pronto** para hacer revisar la masa.
> - Tuvo un episodio de heces blandas un día, no volvió a tener más y está bien: debe
>   **comentarlo en la próxima visita** para ver que todo esté en orden.
> - Tuvo un pequeño accidente que no afectó partes vitales ni comprometió algún miembro u órgano
>   vital, el dueño lo manejó con limpiezas en casa y el animal se recuperó y se ve bien: debe
>   **programar una cita pronto** y hacerlo revisar por si acaso.

---

### M1 — Emergencias absolutas y signos sutiles

**P8. Emergencias propias del gato que la gente no reconoce.**
> Sí, los gatos que no pueden orinar, sobre todo en machos.

**P9. Signos sutiles que el dueño minimiza y ya son bandera roja.**
> El gato entra a la arenera a cada rato y el dueño piensa que no es nada, pero puede ser una
> obstrucción.

**P10. Checklist de emergencia inmediata (sí / no).**
> **Sí, emergencia inmediata:** (a) gato respirando con la boca abierta o jadeando, (b) encías
> pálidas, blancas o azuladas, (c) animal que de un momento a otro no mueve las patas traseras,
> (e) temblores.
> **No emergencia inmediata:** (d) se esconde y no quiere que lo toquen.

---

### M7 — Ingestiones y tóxicos

**P11. ¿Cuáles son siempre emergencia inmediata aunque el animal se vea bien?**
> Todos: (a) chocolate, (b) xilitol, (c) uvas o pasas, (d) cebolla o ajo, (e) medicamentos
> humanos, (f) veneno para ratas, (g) objeto grande.
> En Colombia es frecuente: **envenenamientos, objetos grandes y chocolate**.

---

### M3 / M6 — Umbrales, zona gris y escalado

**P12. Horas sin comer que preocupan.**
> Cachorros, perros pequeños o perros con alguna condición de salud: más de **12 horas** es
> preocupante. Perros sanos: más de **24 horas**. Gatos: más de **12 a 24 horas**.

**P13. Umbral de vómito y diarrea.**
> Solo 1 vómito se considera "obsérvelo". Más de eso es "llévelo ya".
> Diarrea igual: un episodio es "obsérvelo", 2 o más es "llévelo ya".

**P14. Aclaración: perro adulto sano, 2 vómitos en el día, pero come, toma agua y animado.**
> Entra en las 6 a 12 horas (riesgo medio).

**P15. ¿Qué lo pasa a emergencia de ir ya?**
> Más episodios de vómito, decaído, anorexia, sangre, diarrea al mismo tiempo.

---

### M4 — Modificadores del paciente

**P16. ¿Qué pacientes le bajan el umbral?**
> **Todos** los propuestos: cachorros y gatitos, mayores de 10 años, razas de cara chata,
> razas grandes de pecho profundo, diabéticos / cardiacos / renales, hembra preñada o recién
> parida.

**P17. ¿Cómo cambia la conducta en esos pacientes?**
> **Se acorta el tiempo de observación** (no sube el nivel de riesgo).

---

### M6 — Cuadros frecuentes, nivel por presentación

**P18. Nivel de cada caso (bajo / medio / alto).**
> - Tos ocasional, por lo demás bien: **bajo** (consultar pronto).
> - Cojea de una pata pero apoya y come normal: **medio**.
> - Ojo rojo y lagrimeando, lo abre bien: **alto**.
> - Sacude la cabeza y se rasca la oreja: **medio**.
> - Estornudos y moquito, come bien: **alto** (matizado en P19).
> - Orina con sangre pero sí orina: **alto**.

**P19. Aclaración sobre estornudos con secreción nasal.**
> Cambia si el moco es **amarillo o verdoso**.
> (Interpretación: moco transparente con el animal normal no es alto; secreción purulenta sí
> escala. **Pendiente de confirmar** el nivel exacto del caso con moco transparente.)

---

### M5 — Toma de historia clínica

**P20. Interrogatorio mínimo ante "mi perro está vomitando", en orden.**
> 1. ¿Cuántas veces ha vomitado?
> 2. ¿Hace cuánto?
> 3. ¿De qué aspecto es el vómito?
> 4. ¿Está comiendo?
> 5. ¿Tiene diarrea?
> 6. ¿Está tomando agua?
> 7. ¿Está decaído?
> 8. ¿Qué alimento consume?
> 9. ¿Se pudo comer algo extraño?

**P21. ¿Cuándo deja de preguntar y dice directamente "llévelo ya"?**
> Si dice que ha vomitado **más de una vez en poco tiempo (un par de horas)** y que **se ve
> decaído**, no pregunto más: llévelo ya.

---

### M3 — Seguimiento a 24 y 48 horas

**P22. Qué indica mejoría real y qué indica empeoramiento.**
> **Mejoró:** síntomas disminuidos o eliminados, come normal, toma agua normal, más animado.
> **Empeoró:** más síntomas, más frecuencia de los síntomas, decaído, no come, no respira bien,
> jadea, sangra.

---

### M8 — Manejo en casa y primeros auxilios

**P23. Errores comunes del dueño que la app debe desaconsejar explícitamente.**
> Dar medicamentos humanos; poner cosas en piel o heridas; dar remedios caseros o naturales sin
> evidencia científica; provocar el vómito en ciertos casos.

**P24. Qué debe vigilar el dueño durante la observación en casa.**
> Que los síntomas no aumenten ni empeoren, que el animal consuma alimento y agua sin problema,
> y el estado anímico.

**P25. Qué hacer mientras se llega al veterinario en una emergencia.**
> No dar comida ni agua; transportarlo en un medio adecuado y abrigarlo; no permitir que se
> exponga a condiciones medioambientales adversas; contener un sangrado con gasas o paño limpio;
> mantenerlo lo más tranquilo posible durante el transporte.

---

### M10 — Límites y comunicación

**P26. Lo que la app NUNCA debe hacer.**
> Diagnosticar; medicar (alopáticos o naturales); sugerir esperar cuando hay duda; decirle a la
> gente que "no es nada" cuando sí puede serlo.

**P27. Qué quiere ver la veterinaria en el resumen que el dueño le lleva.**
> 1. **Datos completos del paciente:** nombre, edad, especie, **sexo**, raza, **peso actual**,
>    características especiales, diagnósticos anteriores y actuales, propietario (teléfono,
>    dirección), hora de llegada a urgencias.
> 2. **Motivo de consulta.**
> 3. **Historia clínica:** estado, síntomas, **vacunas**, tratamientos previos, comportamiento,
>    **dieta**, **cambios recientes**.
> 4. Evaluación clínica y exámenes diagnósticos.
> 5. Diagnóstico final.
> 6. Tratamientos y recomendaciones en casa.
> 7. Próximos controles.
>
> (Los puntos 4 a 7 los llena el veterinario, no la app. Los puntos 1 a 3 son los que la app
> debe entregar. **Datos que hoy la app no guarda: sexo, vacunas, dieta, cambios recientes,
> teléfono y dirección del propietario.**)

**P28. Tono con un dueño asustado.**
> Tono contenedor, claro, sin términos técnicos, que pueda entender.

---

### M0 / M6 — Confirmaciones de cierre

**P29a. Estornudos con moco transparente, animal totalmente normal.**
> **Medio.**

**P29b. ¿El riesgo bajo siempre incluye agendar consulta?**
> "Obsérvelo **y** agende cita con veterinario pronto, porque así no sea una situación de riesgo
> inmediato ni una emergencia vital, igual el animal está presentando algún síntoma que no es
> normal tener, así que debe llevarlo para tranquilidad del propietario y del médico que atiende
> a ese paciente."

**P29c. Diferencias gato vs perro que el sistema debe tener siempre presentes.**
> **Gatos:** letargia extrema o muy escondidos; se lanzó de cierta altura y aparentemente está
> bien, pero puede estar mal.
> **Perros:** dilatación y torsión gástrica.
> **Ambos:** accidentes o traumatismos; peleas violentas con otros animales; violencia
> proveniente de humanos; problemas durante el parto y procesos de parto muy largos (**más de 2
> horas**); gatitos o cachorros recién paridos que dejan de mamar o lloran mucho; intoxicaciones
> o envenenamientos; diarreas y vómitos; golpe de calor; ingestión de cuerpos extraños;
> convulsiones; dificultad respiratoria.

---

### Cierre — advertencias de la veterinaria (requisitos de producto, no negociables)

**P30. ¿Qué le preocupa de una herramienta así?**
> - No quiero que la herramienta **reemplace el diagnóstico veterinario** ni que la gente deje de
>   consultar con el veterinario, que es el único que puede diagnosticar y medicar.
> - No quiero que los veterinarios **se sientan amenazados** por una herramienta como esta, sino
>   que sea de **ayuda en su práctica diaria**.
> - No quiero **problemas legales** de dueños haciendo malas interpretaciones de lo que les dice
>   la herramienta y que, si al animal le pasa algo, culpen a la herramienta o intenten iniciar
>   procesos legales.

**Traducción a requisitos del producto:**
1. Todo resultado debe reforzar que la app **orienta**, no diagnostica, y que el veterinario es
   el único que diagnostica y medica. Ya existe el disclaimer; debe ser visible en los tres
   niveles, no solo en el alto.
2. **Riesgo bajo nunca puede leerse como "no necesita veterinario"** (ver P29b): siempre incluye
   agendar consulta. Esto es exactamente lo que evita que la herramienta reemplace la consulta.
3. Posicionamiento pro veterinario: el resumen de derivación (P27) y el historial clínico están
   diseñados para que el dueño llegue mejor preparado a la consulta, no para evitarla.
4. Riesgo legal: mantener la asimetría (ante la duda se escala), no prometer resultados, no
   medicar ni diagnosticar, y conservar el registro de lo que la app dijo en cada caso.

---

## CORRECCIONES FINALES DE LA VETERINARIA (mandan sobre todo lo anterior)

> Estas correcciones se hicieron al cierre, después de leer el resumen completo. **Donde
> contradigan una respuesta anterior, gana esta sección.** El desarrollador debe implementar
> estos valores, no los de P2, P3 ni P14.

### C1 — Los tres niveles, redefinidos

- **BAJO:** observar en un plazo de **24 a 48 horas**, siempre que el animal:
  - mantenga una **conducta normal y alerta**,
  - **respire bien**,
  - haga sus **funciones normales**,
  - y **no muestre dolor**.
  (Aplica tanto de día como de noche.) Si alguna de esas condiciones falla, ya no es bajo.
- **MEDIO:** **vigilar cada hora**. Si **empeora**, llevarlo al veterinario **ya**, sin esperar
  las 6 a 12 horas. Si **no empeora o mejora**, seguir vigilando durante las **próximas 6 a 12
  horas** para decidir.
  (Es decir: el medio **no** es una cita obligatoria a las 6 a 12 horas, es una ventana de
  observación activa con punto de decisión al final, o inmediato si empeora.)
- **ALTO:** ya mismo, no espere.

### C2 — Umbral de vómito y diarrea, redefinido

- **1 vómito** o **1 episodio de diarrea** → **MEDIO**.
- **Más de eso** (2 o más episodios) → **ALTO**.

> Esto **reemplaza** la respuesta P14 (donde 2 vómitos con buen estado general quedaban en medio).
> El criterio final de la veterinaria es más escalativo: a partir del segundo episodio, alto.

### C3 — Qué sigue vigente de lo anterior

- La compuerta del **estado general** (come, toma agua, animado, funciones normales, sin dolor,
  respira bien) sigue siendo el eje de todo.
- **P29b confirmado explícitamente después de C1** (ya no queda pendiente): en el riesgo bajo
  **sí se recomienda al propietario agendar cita con el veterinario "para quedar tranquilos"**.
  La corrección C1 solo cambió la ventana de observación, no eliminó la consulta. Por lo tanto,
  el texto de riesgo bajo de la app nunca puede leerse como "no necesita veterinario".
- La regla de corte de P21 (más de un vómito en un par de horas **más** decaído: no preguntar
  más, llevarlo ya) es coherente con C2 y se mantiene.
- Los modificadores del paciente (P16, P17) siguen **acortando la ventana de observación**, sin
  subir el nivel.

---

### Notas de calibración derivadas (interpretación del desarrollador, a validar)

- **El estado general es la compuerta principal, no el síntoma suelto.** Come, toma agua, animado,
  funciones normales: eso es lo que baja el nivel. El mismo síntoma con el animal decaído o sin
  comer sube de nivel.
- **Riesgo bajo NO significa "no necesita veterinario".** En los cuatro ejemplos de P7 la
  veterinaria siempre agrega una consulta no urgente ("en los próximos días", "pronto", "en la
  próxima visita"). El texto actual de riesgo bajo de la app no dice esto y hay que ajustarlo.
- **Síntoma resuelto vs síntoma en curso.** Un episodio aislado que ya pasó y el animal está bien
  es bajo; el mismo síntoma en curso es medio. La duración y la resolución mueven el nivel.
- **La ventana de riesgo medio es de 6 a 12 horas, no de 24.** Los textos actuales de la app
  ("within 24 hours") contradicen el criterio de la veterinaria.
- **Ventana de observación de riesgo bajo:** revisar cada 2 horas de día; de noche, observar y
  reevaluar en la mañana.
- **Ingesta presenciada de algo NO tóxico, con animal asintomático, es medio, no alto.** Hoy el
  sistema fuerza alto ante cualquier mención de haber comido algo. Pendiente de precisar en el
  bloque de tóxicos.
- **Golpe pequeño sin compromiso vital ni sangrado es medio.** Hoy el sistema fuerza alto ante
  cualquier mención de golpe o caída.
