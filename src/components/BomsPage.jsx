import React, { useRef, useState, useEffect } from 'react';
import jspreadsheet from 'jspreadsheet-ce'; 
import jSuites from 'jsuites'; 
import { Button, Modal, Form, Row, Col, InputGroup, FormControl } from 'react-bootstrap';

import 'jspreadsheet-ce/dist/jspreadsheet.css';
import 'jsuites/dist/jsuites.css'; 
import './ProyectosPage.css'; 

// === TRUCO DE LA VARIABLE CSS (--progreso) ===
const generarBarraProgreso = (valor) => {
    let p = parseInt(valor) || 0;
    p = p > 100 ? 100 : p;
    p = p < 0 ? 0 : p;
    
    const claseTexto = p > 60 ? 'barra-texto-blanco' : 'barra-texto-oscuro';

    return `
        <div data-value="${p}" style="width: 100%; background-color: #e6e9ef; border-radius: 10px; height: 20px; position: relative; overflow: hidden; margin-top: 2px;">
            <div class="barra-relleno-azul" style="--progreso: ${p}%; border-radius: 10px; height: 100%; transition: width 0.5s ease;"></div>
            <span class="${claseTexto}" style="position: absolute; top: 0; left: 0; width: 100%; text-align: center; font-size: 12px; font-weight: 600; line-height: 20px; pointer-events: none;">${p}%</span>
        </div>
    `;
};

const BomsPage = ({ cambiarVista }) => {
    const jRef = useRef(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetch('http://localhost:5114/api/BOMs/GetBOMs')
            .then(response => response.json())
            .then(data => {
                const dataDeBD = data.map(item => [
                    item.idItem,                                // 0
                    item.idProyecto,                            // 1
                    item.idSubproyecto,                         // 2
                    item.proyecto,                              // 3
                    item.subproyecto,                           // 4
                    item.bom,                                   // 5
                    item.item,                                  // 6
                    item.numeroParte,                           // 7
                    item.descripcion,                           // 8
                    item.cantidad,                              // 9
                    item.od,                                    // 10
                    item.iD_Medida,                             // 11
                    item.lg,                                    // 12
                    item.material,                              // 13
                    item.tipo,                                  // 14
                    item.recubrimiento,                         // 15
                    item.tratamientoTermico,                    // 16
                    item.observaciones,                         // 17
                    item.soh,                                   // 18
                    item.mfg,                                   // 19
                    item.avance,                                // 20 (Número limpio)
                    generarBarraProgreso(item.avance),          // 21 (Barra Segura)
                    item.eta ? item.eta.split('T')[0] : '',     // 22
                    item.cancelado ? true : false,              // 23 (Checkbox)
                    item.comentarios                            // 24
                ]);

                const opcionesCalendario = {
                    format: 'YYYY-MM-DD',
                    time: false,
                    resetButton: false,
                    months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
                    monthsShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
                    weekdays: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
                    weekdays_short: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
                    weekdays_letter: ['D', 'L', 'M', 'M', 'J', 'V', 'S']
                };

                if (!jRef.current) {
                    jRef.current = jspreadsheet(document.getElementById('spreadsheet'), {
                        tableOverflow: true, 
                        tableHeight: '450px',
                        worksheets: [{
                            data: dataDeBD,
                            defaultRowHeight: 32,
                            columns: [
                                { type: 'text', title: 'IdItem', width: 100, readOnly: true },
                                { type: 'text', title: 'IdProyecto', width: 100 },
                                { type: 'text', title: 'IdSubproyecto', width: 120 },
                                { type: 'text', title: 'Proyecto', width: 150, readOnly: true }, // Intocable
{ type: 'text', title: 'Subproyecto', width: 150, readOnly: true }, // Intocable
                                { type: 'text', title: 'BOM', width: 100 },
                                { type: 'text', title: 'Item', width: 100 },
                                { type: 'text', title: 'No. Parte', width: 120 },
                                { type: 'text', title: 'Descripción', width: 250 },
                                { type: 'numeric', title: 'Cantidad', width: 80 },
                                { type: 'text', title: 'OD', width: 80 },
                                { type: 'text', title: 'ID', width: 80 },
                                { type: 'text', title: 'LG', width: 80 },
                                { type: 'text', title: 'Material', width: 120 },
                                { type: 'text', title: 'Tipo', width: 100 },
                                { type: 'text', title: 'Recubrimiento', width: 120 },
                                { type: 'text', title: 'Trat. Térmico', width: 120 },
                                { type: 'text', title: 'Observaciones', width: 200 },
                                { type: 'numeric', title: 'SOH', width: 80 },
                                { type: 'numeric', title: 'MFG', width: 80 },
                                { type: 'numeric', title: 'Avance %', width: 80, readOnly: true }, // Col 20
                                { type: 'html', title: 'Progreso', width: 150, readOnly: true, stripHTML: false }, // Col 21
                                { type: 'calendar', title: 'ETA', width: 120, options: opcionesCalendario }, // Col 22
                                { type: 'checkbox', title: 'Cancelado', width: 80 }, // Col 23
                                { type: 'text', title: 'Comentarios', width: 250 }, // Col 24
                            ],
                            allowInsertRow: true,
                            allowDeleteRow: true,
                        }],

                        onbeforechange: (worksheet, cell, x, y, value) => {
                            if (x == 21) return false;

                            const oldValue = worksheet.options.data[y][x];
                            const textoViejo = (oldValue === null || oldValue === undefined) ? "" : oldValue;
                            const textoNuevo = (value === null || value === undefined) ? "" : value;

                            if (x == 23) return value; 

                            if (textoViejo != textoNuevo) {
                                const confirmed = window.confirm(`¿Estás seguro de guardar el cambio en la celda?\nDe: ${textoViejo} \nA: ${textoNuevo}`);
                                if (!confirmed) return oldValue;
                            }
                            return value; 
                        },

                        onchange: (worksheet, cell, x, y, value) => {
                            const rowData = worksheet.getRowData(y);
                            const idItem = rowData[0];
                            if (!idItem) return;

                            let isCancelado = false;
                            if (rowData[23] === true || rowData[23] === "true" || rowData[23] === 1 || rowData[23] === "1") isCancelado = true;

                            const payload = {
                                idItem: idItem,
                                idProyecto: rowData[1],
                                idSubproyecto: rowData[2],
                                proyecto: rowData[3],
                                subproyecto: rowData[4],
                                bom: rowData[5],
                                item: rowData[6],
                                numeroParte: rowData[7],
                                descripcion: rowData[8],
                                cantidad: parseInt(rowData[9]) || 0,
                                od: rowData[10] || "",
                                iD_Medida: rowData[11] || "",
                                lg: rowData[12] || "",
                                material: rowData[13] || "",
                                tipo: rowData[14] || "",
                                recubrimiento: rowData[15] || "",
                                tratamientoTermico: rowData[16] || "",
                                observaciones: rowData[17] || "",
                                soh: parseInt(rowData[18]) || 0,
                                mfg: parseInt(rowData[19]) || 0,
                                avance: parseInt(rowData[20]) || 0, // Lee directamente la col 20 numérica
                                eta: rowData[22] || null,
                                cancelado: isCancelado,
                                comentarios: rowData[24] || ""
                            };

                            fetch(`http://localhost:5114/api/BOMs/ActualizarBOM/${idItem}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(payload)
                            })
                            .then(response => {
                                if (!response.ok) throw new Error("Error en el servidor");
                            })
                            .catch(error => console.error("Error al actualizar la base de datos:", error));
                        },
                        onload: () => {
                            document.querySelectorAll('#spreadsheet tbody tr').forEach(fila => {
                                fila.style.height = '32px';
                                fila.style.maxHeight = '32px';
                            });
                        }
                    });
                }
            })
            .catch(error => console.error("Error al cargar los datos:", error));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); 

    const handleCloseModal = () => setShowModal(false);
    const handleShowModal = () => setShowModal(true);

    const NuevoBOMModal = () => {
        const [validated, setValidated] = useState(false);
        const formRef = useRef();

        const handleSubmit = (event) => {
            event.preventDefault();
            const form = event.currentTarget;
            if (form.checkValidity() === false) {
                event.stopPropagation();
                setValidated(true);
                return;
            } 
            
            const formData = new FormData(formRef.current);
            const data = Object.fromEntries(formData.entries());

            const payload = {
                idItem: data.idItem,
                idProyecto: data.idProyecto,
                idSubproyecto: data.idSubproyecto,
                proyecto: data.proyecto,
                subproyecto: data.subproyecto,
                bom: data.bom,
                item: data.item,
                numeroParte: data.numeroParte,
                descripcion: data.descripcion,
                cantidad: parseInt(data.cantidad) || 0,
                od: data.od,
                iD_Medida: data.idMedida,
                lg: data.lg,
                material: data.material,
                tipo: data.tipo,
                recubrimiento: data.recubrimiento,
                tratamientoTermico: data.tratamientoTermico,
                observaciones: data.observaciones,
                soh: parseInt(data.soh) || 0,
                mfg: parseInt(data.mfg) || 0,
                avance: parseInt(data.avance) || 0,
                eta: data.eta || null,
                cancelado: data.cancelado === "on", 
                comentarios: data.comentarios
            };

            fetch('http://localhost:5114/api/BOMs/CrearBOM', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            .then(response => {
                if (!response.ok) throw new Error("Error al guardar en el servidor");
                return response.json();
            })
            .then(savedData => {
                const newRowData = [
                    savedData.idItem, savedData.idProyecto, savedData.idSubproyecto, 
                    savedData.proyecto, savedData.subproyecto, savedData.bom, 
                    savedData.item, savedData.numeroParte, savedData.descripcion, 
                    savedData.cantidad, savedData.od, savedData.iD_Medida, 
                    savedData.lg, savedData.material, savedData.tipo, 
                    savedData.recubrimiento, savedData.tratamientoTermico, savedData.observaciones, 
                    savedData.soh, savedData.mfg, savedData.avance, 
                    generarBarraProgreso(savedData.avance), 
                    savedData.eta ? savedData.eta.split('T')[0] : '', 
                    savedData.cancelado, savedData.comentarios
                ];
                
                if(jRef.current && jRef.current[0]) {
                    jRef.current[0].insertRow(newRowData);
                }
                
                handleCloseModal();
            })
            .catch(error => {
                console.error("Hubo un problema guardando el BOM:", error);
            });
        };

        return (
            <Modal show={showModal} onHide={handleCloseModal} size="xl" centered>
                <Modal.Header closeButton>
                    <Modal.Title className="modal-title-custom">Nuevo <span className="text-success">Item BOM</span></Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form ref={formRef} noValidate validated={validated} onSubmit={handleSubmit}>
                        
                        <h6 className="text-primary mb-3 border-bottom pb-2">Llaves y Referencias</h6>
                        <Row className="mb-3">
                            <Form.Group as={Col}><Form.Label>IdItem *</Form.Label><Form.Control required name="idItem" /></Form.Group>
                            <Form.Group as={Col}><Form.Label>IdProyecto (FK)</Form.Label><Form.Control name="idProyecto" /></Form.Group>
                            <Form.Group as={Col}><Form.Label>IdSubproyecto (FK)</Form.Label><Form.Control name="idSubproyecto" /></Form.Group>
                        </Row>
                        <Row className="mb-3">
                            <Form.Group as={Col}><Form.Label>Proyecto</Form.Label><Form.Control name="proyecto" /></Form.Group>
                            <Form.Group as={Col}><Form.Label>Subproyecto</Form.Label><Form.Control name="subproyecto" /></Form.Group>
                            <Form.Group as={Col}><Form.Label>BOM (Agrupación)</Form.Label><Form.Control name="bom" /></Form.Group>
                        </Row>

                        <h6 className="text-primary mb-3 border-bottom pb-2 mt-4">Detalles del Ítem</h6>
                        <Row className="mb-3">
                            <Form.Group as={Col}><Form.Label>Item / Alias</Form.Label><Form.Control name="item" /></Form.Group>
                            <Form.Group as={Col}><Form.Label>No. Parte</Form.Label><Form.Control name="numeroParte" /></Form.Group>
                            <Form.Group as={Col}><Form.Label>Cantidad</Form.Label><Form.Control type="number" name="cantidad" defaultValue="1" /></Form.Group>
                        </Row>
                        <Form.Group className="mb-3"><Form.Label>Descripción</Form.Label><Form.Control name="descripcion" /></Form.Group>

                        <h6 className="text-primary mb-3 border-bottom pb-2 mt-4">Especificaciones Físicas</h6>
                        <Row className="mb-3">
                            <Form.Group as={Col}><Form.Label>OD</Form.Label><Form.Control name="od" /></Form.Group>
                            <Form.Group as={Col}><Form.Label>ID</Form.Label><Form.Control name="idMedida" /></Form.Group>
                            <Form.Group as={Col}><Form.Label>LG</Form.Label><Form.Control name="lg" /></Form.Group>
                            <Form.Group as={Col}><Form.Label>Material</Form.Label><Form.Control name="material" /></Form.Group>
                        </Row>
                        <Row className="mb-3">
                            <Form.Group as={Col}><Form.Label>Tipo</Form.Label><Form.Control name="tipo" /></Form.Group>
                            <Form.Group as={Col}><Form.Label>Recubrimiento</Form.Label><Form.Control name="recubrimiento" /></Form.Group>
                            <Form.Group as={Col}><Form.Label>Tratamiento T.</Form.Label><Form.Control name="tratamientoTermico" /></Form.Group>
                        </Row>

                        <h6 className="text-primary mb-3 border-bottom pb-2 mt-4">Estatus y Producción</h6>
                        <Row className="mb-3">
                            <Form.Group as={Col}><Form.Label>SOH</Form.Label><Form.Control type="number" name="soh" defaultValue="0" /></Form.Group>
                            <Form.Group as={Col}><Form.Label>MFG</Form.Label><Form.Control type="number" name="mfg" defaultValue="0" /></Form.Group>
                            <Form.Group as={Col}><Form.Label>Avance %</Form.Label><Form.Control type="number" name="avance" defaultValue="0" min="0" max="100" /></Form.Group>
                            <Form.Group as={Col}><Form.Label>ETA</Form.Label><Form.Control type="date" name="eta" /></Form.Group>
                        </Row>

                        <Row className="mb-3 align-items-center">
                            <Form.Group as={Col} xs={3}>
                                <Form.Check type="switch" id="cancelado" name="cancelado" label="Cancelado" className="text-danger fw-bold" />
                            </Form.Group>
                            <Form.Group as={Col}>
                                <Form.Control as="textarea" rows={1} name="observaciones" placeholder="Observaciones breves..." />
                            </Form.Group>
                        </Row>

                        <div className="d-flex justify-content-end mt-4">
                            <Button variant="secondary" onClick={handleCloseModal} className="me-2">Cancelar</Button>
                            <Button variant="success" type="submit">Guardar Ítem BOM</Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        );
    };

    return (
        <div className="wrapper">
            <header className="header-container mb-4">
                <div className="header-left">
                    <h1 className="header-title">Gestión de <span className="text-success">BOMs</span></h1>
                    <div className="d-flex align-items-center mt-2">
                        <Button variant="primary" size="sm" onClick={handleShowModal}>+ Nuevo BOM</Button>
                        <InputGroup className="ms-2 search-input">
                            <InputGroup.Text><i className="fa fa-search"></i></InputGroup.Text>
                            <FormControl placeholder="Buscar parte o descripción..." />
                        </InputGroup>
                    </div>
                </div>
                {/* MENÚ DE NAVEGACIÓN */}
                <div className="header-right">
                    <div className="top-tabs mb-2">
                        <span onClick={() => cambiarVista('proyectos')}>Proyectos</span>
                        <span onClick={() => cambiarVista('subproyectos')}>Subproyectos</span>
                        <span onClick={() => cambiarVista('gantt')}>Gantt</span>
                        <span className="active-tab">BOMs</span>
                    </div>
                </div>
            </header>

            <main className="main-content">
                <div id="spreadsheet" className="spreadsheet-container"></div>
            </main>

            <NuevoBOMModal />
        </div>
    );
};

export default BomsPage;