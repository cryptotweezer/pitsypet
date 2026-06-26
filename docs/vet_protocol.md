# vet_protocol.md — Sesión de calibración clínica con un veterinario

> **Cómo se usa este archivo:** decile a Claude **"corré el `vet_protocol.md`"** y
> Claude entiende que está sentado charlando con un **veterinario experto** y conduce
> toda la entrevista de principio a fin, ajustando la IA a medida que el vet responde.
> El veterinario **no sabe de código** — solo responde preguntas clínicas en español.
> Claude hace **todo** el trabajo técnico.

---

## 0. Instrucciones para Claude (leer antes de empezar — el vet NO lee esta sección)

**Tu rol.** Estás entrevistando a un veterinario para subir la acertividad del
triage de PitsyPet. El vet aporta el criterio clínico; vos lo convertís en código.
El vet solo está disponible en **esta** sesión: aprovechala al máximo. Si una
respuesta queda vaga, **repreguntá** hasta tener algo accionable (un umbral, una
ventana de tiempo, una condición, una lista). Mejor preguntar de más que quedarte
con un criterio ambiguo.

**Idioma (regla dura).** Conversás y preguntás **en español**. Pero **todo lo que
escribas en el código va en inglés**: prompts, rúbricas, patrones (regex), textos de
recomendaciones, nombres de contactos, casos de test. **Nada de español dentro del
código.** Vos traducís el criterio clínico del vet al inglés cuando lo aplicás.

**Cadencia — módulo por módulo (no de corrido).**
1. Presentás el módulo en una frase y hacés sus preguntas **conversando**, no como
   formulario. No vuelques todas las preguntas de golpe; seguí el hilo.
2. Cuando el módulo está completo, **aplicás los cambios al código** correspondiente.
3. Le mostrás al vet un **resumen en lenguaje llano** ("Esto es lo que ajusté y por
   qué", sin jerga de programación) y le pedís que confirme o corrija.
4. Recién entonces pasás al siguiente módulo. Si corrige, reajustás antes de seguir.

**Invariantes de seguridad — NO se tocan, pase lo que responda el vet:**
- El **safety override solo escala**. El vet puede **agregar** emergencias a la lista
  que fuerza "riesgo alto", **nunca quitar** una escalación ni bajar un resultado.
- **Ante la duda, se sube el riesgo.** Una emergencia perdida es mucho peor que una
  visita innecesaria. Esta asimetría se mantiene siempre.
- **`confidence_score` es solo para registro** — no decide nada, no es compuerta.
- La **urgencia es solo señal de re-ordenamiento** del conocimiento (RAG), nunca un
  filtro que oculte información.
- Si el criterio del vet entrara en conflicto con estos invariantes, **se respeta el
  invariante** y se lo explicás con tacto.

**Mapa de palancas — qué archivo toca cada módulo (referencia para vos):**

| Módulo | Qué ajusta | Dónde (archivo/tabla, todo en inglés) |
|---|---|---|
| M0 Filosofía / 3 niveles | Definiciones y ventanas de Low/Medium/High | `src/lib/ai/classifier.ts` (system prompt), textos de `recommendations.tsx`, `fallback.ts` |
| M1 Emergencias absolutas | Lista determinista que fuerza High | `src/lib/ai/safety.ts` (`CRITICAL_PATTERNS`) + emergency-override del prompt de chat |
| M2 Manejo en casa | Permiso explícito para elegir Low | rúbrica en `src/lib/ai/classifier.ts` |
| M3 Zona gris / escalado / seguimiento | Criterios Medium y reglas de subir/bajar y de follow-up | `classifier.ts`, `fallback.ts`, lógica de follow-up |
| M4 Modificadores del paciente | Cómo pesan especie/raza/edad/peso/condiciones | rúbrica en `classifier.ts` (usa `formatPet`) |
| M5 Toma de historia | Qué pregunta la IA y cuándo termina | `EXTRACTION_SYSTEM_PROMPT` en `src/app/api/assessment/chat/route.ts` |
| M6 Síntomas comunes | Los 3 niveles por presentación | rúbrica de `classifier.ts` + pesos de `fallback.ts` |
| M7 Tóxicos (Australia) | Ingestiones que son siempre emergencia | `safety.ts` + `fallback.ts` |
| M8 Primeros auxilios | Consejo de casa para riesgo bajo | tabla `first_aid_recommendations` |
| M9 Emergencia / derivación | Contactos reales + criterios de derivación | tabla `emergency_contacts` + prompt |
| M10 Tono / disclaimers / resumen al vet | Comunicación, límites y el resumen de derivación | `EXTRACTION_SYSTEM_PROMPT`, `classifier.ts`, `src/lib/ai/vet-summary.ts` |
| M11 Casos de calibración | Mide la acertividad y valida el tuneo | `src/lib/ai/__tests__/triage-regression.test.ts` |

**Cómo escribir la rúbrica (importante para no romper nada):** definí criterios
**a nivel de regla** (umbrales, ventanas de tiempo, condiciones, combinaciones),
**no listas de síntomas hardcodeadas** en el prompt del clasificador. Las listas
duras solo van en `safety.ts` (emergencias absolutas) y `fallback.ts` (modo offline).

**Al cerrar la sesión:** corré `npm test`, reportá la acertividad en lenguaje llano,
listá por archivo todo lo ajustado, anotá lo pendiente (datos de emergencia que el
vet tenga que conseguir, contenido para el RAG que reforzará estos umbrales) y
actualizá `docs/DEV_LOG.md` + el roadmap en `CLAUDE.md`.

---

## 1. Apertura (esto sí se lo decís al vet)

> "Hola, gracias por tu tiempo. PitsyPet es una herramienta **educativa** de
> orientación (triage) para dueños de perros y gatos en Australia: el dueño describe
> los síntomas en un chat, y la app estima si es **riesgo bajo** (manejable en casa),
> **medio** (conviene ver al vet) o **alto** (emergencia), y da recomendaciones.
> **No es un diagnóstico.** Tu trabajo hoy es ayudarme a afinar ese criterio para que
> acierte mucho más. Yo me encargo de toda la parte técnica — vos solo respondé como
> veterinario, con tus palabras. Vamos por temas; al final de cada tema te muestro qué
> ajusté para que lo valides. Si algo no te cierra, me lo decís y lo corrijo. ¿Listo?"

---

## M0 — Filosofía de triage y los tres niveles

**Objetivo:** marco general y definiciones accionables de Low / Medium / High, con la
acción concreta y la ventana de tiempo de cada uno.

**Preguntas para el veterinario:**
1. Para arrancar, contame brevemente tu experiencia: ¿con qué especies trabajás más,
   cuántos años, en qué ámbito (clínica general, emergencias, etc.)? *(me sirve para
   pesar tus respuestas.)*
2. Cuando orientás a un dueño **por teléfono o a distancia**, sin ver al animal,
   ¿qué principios seguís? ¿En qué casos preferís pecar de precavido?
3. Para vos, ¿qué define un caso de **riesgo BAJO**, manejable en casa? ¿Cuál es la
   acción que le dirías al dueño y en qué ventana de tiempo?
4. ¿Qué define un **riesgo MEDIO** (necesita ver al vet, pero no es una emergencia de
   esa misma hora)? ¿En cuánto tiempo debería verlo: el mismo día, 24 h, 48 h?
5. ¿Qué define un **riesgo ALTO** (emergencia, hay que actuar ya)?
6. ¿Tres niveles te alcanzan, o distinguirías algo intermedio (p. ej. "ver al vet
   hoy" vs "ver al vet esta semana")?

> 🔧 **Para Claude:** escribí en `classifier.ts` (system prompt) las **definiciones
> explícitas** de Low/Medium/High con la acción y la ventana de cada nivel (en inglés).
> Sincronizá los textos de `recommendations.tsx` (hoy dice "within 24 hours" para
> Medium — confirmá/ajustá) y los `recommendedAction` de `fallback.ts`. Cerrá el
> módulo con el resumen llano.

---

## M1 — Emergencias que nunca se deben pasar por alto

**Objetivo:** la lista determinista que **fuerza riesgo alto** sí o sí (y que el dueño
no pueda "esperar a ver"). Esto es lo más crítico de la sesión.

**Preguntas para el veterinario:**
1. Listame los cuadros que para vos son **siempre emergencia** en **PERROS** — esos
   que nunca deberían quedar en "observá en casa".
2. Lo mismo para **GATOS**. ¿Hay emergencias propias del gato que la gente no
   reconoce? (p. ej. gato macho que intenta orinar y no puede, respiración con la boca
   abierta, gato que de golpe no usa las patas traseras…)
3. Para **cada** una de esas emergencias: ¿cómo la describiría un dueño común que no
   sabe el término técnico? Necesito **las palabras que usa la gente** ("la panza
   dura e hinchada", "respira raro", "se desmayó", "las encías blancas").
4. ¿Hay signos **sutiles** que el dueño suele minimizar pero que para vos ya son
   bandera roja? (encías pálidas/azuladas, respirar con el abdomen, esconderse,
   temblar, no levantarse…)
5. Al revés: ¿algún signo que **parece** gravísimo y que solemos sobre-reaccionar,
   pero que en general no es emergencia?

> 🔧 **Para Claude:** traducí cada emergencia a patrones en inglés (término clínico +
> frase llana + coloquial australiano) y agregalos a `CRITICAL_PATTERNS` en
> `safety.ts`; sincronizá la lista del **emergency-override** dentro del
> `EXTRACTION_SYSTEM_PROMPT`. **Solo se agrega, nunca se quita.** La pregunta 5
> NO elimina nada de la lista de seguridad: a lo sumo informa el tono, no baja
> escalaciones.

---

## M2 — Cuadros seguros de manejar en casa (permiso para "riesgo bajo")

**Objetivo:** corregir la **sobre-escalación**. Hoy, con poca info, el sistema manda
casi todo al vet. Necesito tu permiso explícito para decir "esto se puede observar en
casa" cuando corresponde.

**Preguntas para el veterinario:**
1. ¿Qué presentaciones **leves, aisladas**, en un animal por lo demás bien, son
   razonables de **monitorear en casa primero**?
2. Para cada una, ¿**cuánto tiempo** es seguro observar antes de que sí deba ver al
   vet? (la "ventana de seguridad": ¿12 h, 24 h, 48 h?)
3. ¿Qué **condiciones** se tienen que cumplir para considerar algo "manejo en casa"?
   (p. ej. come y toma agua normal, está activo, es un solo síntoma, es leve, no hay
   signos generales como fiebre o decaimiento marcado…)
4. Dentro de un cuadro leve, ¿qué **señal** te hace cambiar de idea y mandarlo al vet
   igual? (los "rompe-reglas")

> 🔧 **Para Claude:** agregá a la rúbrica de `classifier.ts` el permiso explícito de
> elegir **Low / home-care** para cuadros genuinamente leves y aislados, expresado
> como **criterios** (condiciones + ventana de tiempo + rompe-reglas), nunca como
> lista de síntomas. Esto no toca los invariantes: la asimetría sigue.

---

## M3 — La zona gris (Medium), el escalado y el seguimiento

**Objetivo:** criterios de riesgo medio y reglas de subir/bajar — incluido el
**seguimiento** (la app permite re-evaluar a las 24/48 h).

**Preguntas para el veterinario:**
1. ¿Qué hace que un caso leve pase a "mejor que lo vea el vet" (medio)? (duración, no
   mejora, recurrencia, varios síntomas juntos…)
2. ¿Qué **combinaciones** de síntomas que por separado son leves, **juntas** te
   preocupan?
3. ¿Cuándo "todavía no come" o "está decaído" deja de ser leve y pasa a preocupante?
   Dame umbrales por especie si difieren (p. ej. un gato que no come en 24 h vs un
   perro).
4. ¿Cuándo un caso medio se te transforma en **emergencia**?
5. **Seguimiento:** cuando el dueño vuelve a las 24–48 h, ¿qué cambio indica una
   **mejora real** (se puede seguir en casa) y qué cambio ya te dice "esto empeoró,
   andá al vet"?

> 🔧 **Para Claude:** codificá los criterios Medium y las reglas de escalado por
> duración/combinación en la rúbrica de `classifier.ts`; ajustá umbrales/pesos en
> `fallback.ts`; y reflejá las reglas de seguimiento en cómo se clasifica un
> follow-up (la app ya distingue follow-ups y reconcilia síntomas activos).

---

## M4 — Modificadores del paciente (especie, raza, edad, peso, condiciones)

**Objetivo:** cómo el contexto del paciente cambia la urgencia. La app ya le pasa al
modelo la especie, raza, edad, peso, condiciones y medicación — quiero que el criterio
para **usarlos** salga de vos.

**Preguntas para el veterinario:**
1. ¿Cómo cambia tu nivel de alarma según la **edad**? (un cachorro/gatito muy chico;
   un animal **senior**) — ¿qué baja el umbral para mandarlo al vet?
2. ¿Qué **razas o tipos** te ponen más alerta para ciertos cuadros? Dame el
   **principio**, no una lista exhaustiva: p. ej. braquicefálicos (cara chata) y
   problemas respiratorios/calor; razas grandes de **tórax profundo** y torsión
   gástrica; etc.
3. ¿Cómo pesan las **condiciones preexistentes** o la **medicación** actual? (un
   diabético que vomita, un cardíaco que tose, uno con insuficiencia renal que deja de
   comer…)
4. ¿El **tamaño/peso** cambia tu evaluación? (deshidratación en un cachorro chico;
   tóxicos cuya gravedad depende de la dosis por kilo…)
5. Diferencias **gato vs perro** que el sistema debería tener **siempre** presentes.

> 🔧 **Para Claude:** agregá reglas de modificadores a la rúbrica de `classifier.ts`
> (cómo ponderar edad/raza/peso/condiciones — `formatPet` ya entrega estos datos).
> Donde aplique a predisposición racial, anotá el principio para informar el etiquetado
> `breed_specific` del ingest de RAG más adelante.

---

## M5 — Toma de historia clínica: qué preguntar y cuándo alcanza

**Objetivo:** el corazón de la conversación. Define **qué preguntas hace la IA**, en
qué orden, y **cuándo tiene suficiente** para orientar.

**Preguntas para el veterinario:**
1. Cuando un dueño te dice "mi perro está vomitando", ¿qué le preguntás **siempre**,
   y en qué orden? Dame tu interrogatorio mínimo.
2. ¿Qué datos son **imprescindibles** antes de animarte a dar una orientación de
   urgencia? (inicio, duración, frecuencia, si progresa, apetito, si toma agua,
   energía, orina/heces, respiración…)
3. ¿Cómo definís **leve / moderado / severo** para un síntoma? Necesito cómo lo
   gradúas para que el sistema clasifique bien la severidad de cada síntoma reportado.
4. Casos puntuales: para **vómito/diarrea**, ¿qué características importan (sangre,
   color, cuántas veces, contenido)? Para **dificultad respiratoria**, ¿qué preguntás?
   Para **cojera/dolor**, ¿qué? Para **"decaído"**, ¿qué?
5. ¿**Cuántas** preguntas te alcanzan, en general, para una orientación responsable?
   ¿Cuándo conviene **cortar** y decir directamente "andá al vet" en vez de seguir
   preguntando?
6. ¿Hay preguntas distintas según **especie o edad** que siempre conviene hacer?

> 🔧 **Para Claude:** reescribí el `EXTRACTION_SYSTEM_PROMPT` con el orden de
> interrogatorio, los campos imprescindibles, las líneas por presentación y la lógica
> de "cuándo hay suficiente". Mapeá la graduación de severidad al enum
> `mild/moderate/severe` del esquema de extracción. **Conservá** lo no-negociable que
> ya tiene el prompt: confirmar antes de completar, el emergency-override, y **no
> inventar síntomas** a partir de medicación/condiciones (preguntar y registrar solo
> si el dueño confirma).

---

## M6 — Profundización por síntoma común (el grueso de la rúbrica)

**Objetivo:** para cada cuadro frecuente, marcar **cuándo es casa, cuándo es vet
pronto, y cuándo es emergencia**, más cualquier matiz. Esto alimenta los ejemplos de
la rúbrica y los pesos del modo offline.

> **Para el vet:** vamos a recorrer los cuadros más comunes. Para cada uno te pregunto
> lo mismo: *¿cuándo se maneja en casa, cuándo conviene ver al vet, y cuándo es
> emergencia?* Si dos se manejan igual, agrupalos. Si de alguno querés agregar un
> detalle (qué pregunta clave lo define, diferencias perro/gato), mejor.

Recorré con el vet, uno por uno:
1. **Vómito**
2. **Diarrea**
3. **No come / inapetencia**
4. **Decaimiento / letargo / debilidad**
5. **Tos**
6. **Dificultad para respirar / jadeo excesivo**
7. **Cojera / dolor**
8. **Picazón / problemas de piel / heridas leves**
9. **Ojo** (rojo, cerrado, lagrimeo, lastimado)
10. **Oído** (sacude la cabeza, mal olor, dolor)
11. **Orina** (no puede, le cuesta, con sangre, muy seguido)
12. **Convulsión / temblores**
13. **Sangrado / heridas / mordeduras**
14. **Colapso / desmayo / pérdida de conocimiento**
15. **Panza hinchada y dura / arcadas sin vomitar** (torsión gástrica)
16. **Parto / problemas en el parto**
17. **Fiebre / golpe de calor**

> 🔧 **Para Claude:** cada respuesta → un **criterio/ejemplo de nivel** en la rúbrica
> de `classifier.ts` (guía por nivel, no lista hardcodeada) + ajuste de **pesos** en
> `fallback.ts`. Los cuadros que el vet marque como **siempre emergencia** (12, 14,
> 15, y los severos de 6/11/13/17) van **también** a `safety.ts`. Llevá una mini-tabla
> mental de cobertura para no saltarte ninguno.

---

## M7 — Tóxicos e ingestiones (foco Australia)

**Objetivo:** qué ingestiones son **siempre emergencia**, con foco en lo específico de
Australia.

**Preguntas para el veterinario:**
1. ¿Qué ingestiones tratás **siempre** como emergencia, sin importar la cantidad?
2. **Específicos de Australia:** cebo para caracoles/babosas (snail/slug bait,
   metaldehído), 1080, **garrapata paralizante** (paralysis tick), **mordedura de
   serpiente**, **sapo de caña** (cane toad), arañas — ¿cuáles te preocupan y con qué
   signos se presentan?
3. **Tóxicos domésticos comunes:** chocolate, xilitol, uvas/pasas, cebolla/ajo,
   medicamentos humanos, anticongelante, veneno para ratas — ¿cuáles dependen de la
   dosis/peso y cuáles son emergencia **sí o sí**?
4. La **garrapata paralizante** es muy de allá: ¿qué signos **tempranos** debería
   reconocer un dueño? (voz cambiada, patas traseras flojas, arcadas…)
5. Si el dueño dice "comió algo pero por ahora está bien", ¿cuándo es **igual**
   emergencia (porque los signos tardan)?

> 🔧 **Para Claude:** agregá los términos australianos y los tóxicos "siempre
> emergencia" a `safety.ts` y `fallback.ts` (en inglés). Respetá la asimetría: ante
> ingesta **sospechada** de algo tóxico → escalar. Anotá para el futuro RAG los
> matices dosis-dependientes (chocolate por kg, etc.).

---

## M8 — Primeros auxilios y manejo en casa (riesgo bajo)

**Objetivo:** el **texto de consejo** que se le muestra al dueño cuando el caso es de
riesgo bajo.

**Preguntas para el veterinario:**
1. Para cada cuadro que marcaste como "manejo en casa" (M2/M6), ¿cuál es el **consejo
   correcto** para el dueño? (qué hacer, qué **no** hacer, qué vigilar, cuándo
   escalar).
2. ¿Qué **errores comunes** comete la gente en casa que quieras desalentar de forma
   explícita? (dar medicación humana, hacer vomitar sin indicación, poner cosas en una
   herida…)
3. ¿Hay consejos que cambian según la **edad** (cachorro/gatito/senior)?
4. Para casos medios/altos: ¿qué **primeros auxilios** mientras se llega al vet? (cómo
   trasladar, no dar de comer si quizá hay que operar, frío/calor, contener un
   sangrado…)

> 🔧 **Para Claude:** cada consejo → una fila en `first_aid_recommendations`
> (`symptom_name`, `recommendation_text`, `risk_level`, `age_range`) **en inglés**.
> Mantené el tono educativo y los límites (no recetar dosis).

---

## M9 — Recursos de emergencia y derivación

**Objetivo:** poblar la lista real de **contactos de emergencia** y los criterios de
derivación.

**Preguntas para el veterinario:**
1. ¿Qué recursos de **emergencia veterinaria** en Australia deberíamos listar?
   (hospitales 24 h, urgencias por estado). Si tenés nombres/teléfonos, dámelos.
2. ¿Hay **hotlines de toxicología / envenenamiento** de mascotas en Australia que el
   dueño deba conocer?
3. ¿Cuándo conviene ir a un **hospital de emergencia** vs esperar al **vet de
   cabecera**?
4. ¿Qué **información** debería tener lista el dueño al llamar o llegar a la
   emergencia? (peso, qué comió y cuánto, hora, foto…)

> 🔧 **Para Claude:** cargá los datos reales en `emergency_contacts` (`name`, `phone`,
> `address`, `is_24h`, `state`, `website`) en inglés; sumá los criterios de derivación
> al prompt. Si el vet **no** tiene la lista a mano, registrá explícitamente qué falta
> conseguir (queda como pendiente del cierre).

---

## M10 — Tono, comunicación, disclaimers y resumen para el veterinario

**Objetivo:** cómo se comunica la IA con el dueño, sus límites, y qué debe contener el
**resumen de derivación** que la app genera para llevarle al vet.

**Preguntas para el veterinario:**
1. ¿Cómo le hablarías a un dueño **asustado**? ¿Qué tono querés que use el sistema?
   (calmado, claro, sin tecnicismos).
2. ¿Qué **disclaimers** son imprescindibles? (no es diagnóstico, es orientación
   educativa, ante la duda consultá…).
3. ¿Qué temas están **fuera de alcance** y la IA **no** debería abordar? (dosis
   exactas de medicación, diagnósticos definitivos, recetar…).
4. ¿Cómo querés que se exprese la **incertidumbre** al dueño, sin alarmar de más ni de
   menos?
5. ¿Algo que la IA **nunca** debería decir o sugerir?
6. La app puede generar un **resumen para que el dueño le lleve al veterinario**.
   Como vet que **recibe** ese resumen, ¿qué información querés ver sí o sí, y en qué
   orden? (motivo, síntomas y desde cuándo, qué se observó, medicación, urgencia…).

> 🔧 **Para Claude:** ajustá tono/disclaimers en el `EXTRACTION_SYSTEM_PROMPT` y el
> estilo de `clinicalReasoning`/`aboutSymptoms` en `classifier.ts` (en inglés,
> educativo, no diagnóstico). La pregunta 6 ajusta el contenido del resumen de
> derivación en `src/lib/ai/vet-summary.ts` — **sin** ablandar nunca la prioridad de
> triage (que se calcula de forma determinista a partir del riesgo guardado).

---

## M11 — Casos de calibración (gold standard) — la prueba de acertividad

**Objetivo:** armar el conjunto de casos con respuesta "correcta" que **mide** la
acertividad del sistema y **valida** todo lo que ajustamos hoy.

**Preguntas para el veterinario:**
1. Dame **15 a 20 escenarios** realistas. Para cada uno: especie/raza/edad si importa,
   los **síntomas tal como los contaría un dueño** (con sus palabras), y cuál es el
   **nivel correcto** (bajo / medio / alto) y la **acción esperada**.
2. Incluí varios **"tramposos"**: casos que **parecen** graves y no lo son, y casos
   que **parecen** leves y sí lo son.
3. Para los de **alto**: ¿cuál es la **bandera roja** que lo define?

> 🔧 **Para Claude:** convertí cada escenario en un caso de `triage-regression.test.ts`
> (en inglés). Corré `npm test`, contá cuántos acierta el sistema **ya ajustado** y
> reportáselo al vet en lenguaje llano: dónde coincide y dónde difiere. Donde el
> sistema no coincida con el criterio del vet, **reajustá la rúbrica** y volvé a
> correr, hasta que el desacuerdo restante sea solo casos donde el sistema escala de
> más (lo aceptable) y nunca de menos.

---

## Cierre de la sesión (Claude lo ejecuta)

1. **Corré toda la batería:** `npm test` + `npx tsc --noEmit` + `npm run lint`. Todo
   verde.
2. **Reportá la acertividad** del set de calibración en lenguaje llano para el vet.
3. **Resumen final por archivo** (qué cambió y por qué, sin jerga) y **agradecé**.
4. **Pendientes:** anotá lo que el vet deba conseguir (p. ej. lista de emergencias
   reales) y dejá señalado que el **contenido del RAG** que se ingiera más adelante
   debe **reforzar** estos mismos umbrales (no contradecirlos).
5. **Documentá:** nueva entrada en `docs/DEV_LOG.md` + actualizá el estado en
   `CLAUDE.md` (incluida la sección "Triage calibration & tuning").

### Checklist de cobertura (verificá antes de cerrar)

- [ ] `classifier.ts` — definiciones Low/Medium/High + rúbrica + modificadores del paciente
- [ ] `safety.ts` — emergencias absolutas (perro + gato + tóxicos AU), solo agregadas
- [ ] `EXTRACTION_SYSTEM_PROMPT` — interrogatorio, severidad, "cuándo alcanza", tono/disclaimers
- [ ] `fallback.ts` — pesos y umbrales del modo offline coherentes con la rúbrica
- [ ] `first_aid_recommendations` — consejos de casa para riesgo bajo (en inglés)
- [ ] `emergency_contacts` — contactos reales (o pendiente registrado)
- [ ] `vet-summary.ts` — contenido del resumen de derivación
- [ ] `triage-regression.test.ts` — set de calibración del vet, `npm test` verde
- [ ] Invariantes de seguridad intactos (override solo escala; ante la duda, sube; confidence solo log; urgencia solo re-rank)
