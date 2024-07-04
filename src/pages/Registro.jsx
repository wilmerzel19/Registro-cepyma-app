import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import '../App.css'
import swal from 'sweetalert'
import ReactPaginate from 'react-paginate';
import {
  CargarProductos, EliminarProducto,
  CrearProducto, EditarProducto, ImportarProductos
} from '../firebase/data'

const Registro = () => {
  const [productos, setProductos] = useState([]);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [codigo, setCodigo] = useState('');
  const [modelo, setModelo] = useState('');
  const [cantidad, setCantidad] = useState(0);
  const [imagenUrl, setImagenUrl] = useState('');
  const [id, setId] = useState('');
  const { } = useParams();

  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevaDescripcion, setNuevaDescripcion] = useState('');
  const [nuevoCodigo, setNuevoCodigo] = useState('');
  const [nuevoModelo, setNuevoModelo] = useState('');
  const [nuevaCantidad, setNuevaCantidad] = useState(0);

  const [cargando, setCargando] = useState(false);
  const [articulos, setArticulos] = useState([]);

  const producto = {
    nombre: nuevoNombre,
    descripcion: nuevaDescripcion,
    codigo: nuevoCodigo,
    modelo: nuevoModelo,
    cantidad: nuevaCantidad,
  }

  const productoeditar = {
    id: id,
    nombre: nombre,
    descripcion: descripcion,
    codigo: codigo,
    modelo: modelo,
    cantidad: cantidad,
  }

  const crearArticulo = async (e) => {
    e.preventDefault()
    setCargando(true)
    const res = await CrearProducto(producto)
    setCargando(false)
    e.target.reset()
    setNuevoNombre("");
    setNuevaDescripcion("");
    setNuevoCodigo("");
    setNuevoModelo("");
    setNuevaCantidad(0);
    getProductos();
  }

  const ActualizarProducto = async (e) => {
    e.preventDefault()
    setCargando(true)
    const res = await EditarProducto(productoeditar)
    setCargando(false)
  }

  const getProductos = async () => {
    setCargando(true)
    const productos = await CargarProductos()
    console.log(productos)
    setProductos(productos)
    setArticulos(productos)
    setCargando(false)
  }

  useEffect(() => {
    getProductos()
  }, [])

  const mostrarProducto = (producto) => {
    setNombre(producto.nombre || '')
    setDescripcion(producto.descripcion || '')
    setCodigo(producto.codigo || '')
    setModelo(producto.modelo || '')
    setCantidad(producto.cantidad || 0)
    setId(producto.id)
  }

  const exportar = () => {
    let wb = XLSX.utils.book_new();
    var productos = [];
    articulos.map((articulo) => {
      productos.push({
        nombre: articulo.nombre,
        descripcion: articulo.descripcion,
        codigo: articulo.codigo,
        modelo: articulo.modelo,
        cantidad: articulo.cantidad,
        fechaCreacion: articulo.fechaCreacion ? formatDate(articulo.fechaCreacion.toDate()) : 'Sin fecha',
        fechaModificacion: articulo.fechaModificacion ? formatDate(articulo.fechaModificacion.toDate()) : 'Sin fecha',
      })
    })
    let ws = XLSX.utils.json_to_sheet(productos);
    var nombre = "Registro " + " " + new Date().toLocaleDateString();
    XLSX.utils.book_append_sheet(wb, ws, "Registro");
    XLSX.writeFile(wb, nombre + ".xlsx");
  }

  const fechImport = async (productos) => {
    const confirmacion = await swal({
      title: "Importar registro",
      text: "¿Estas seguro que deseas importar los registro?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    });
    if (confirmacion) {
      setCargando(true)
      await ImportarProductos(productos)
      setCargando(false)
      swal("Productos importados correctamente", {
        icon: "success",
      });
      getProductos()
    }
  }

  const fecheliminar = async (id) => {
    const confirmacion = await swal({
      title: "Eliminar registro",
      text: "¿Estas seguro que deseas eliminar el registro?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    });
    if (confirmacion) {
      setCargando(true)
      await EliminarProducto(id)
      setCargando(false)
      swal("Producto eliminado correctamente", {
        icon: "success",
      });
      getProductos()
    }
  }

  const importar = async (file) => {
    var reader = new FileReader();
    reader.onload = function (e) {
      var data = e.target.result;
      var workbook = XLSX.read(data, {
        type: 'binary'
      });
      workbook.SheetNames.forEach(function (sheetName) {
        var XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
        var json_object = JSON.stringify(XL_row_object);
        console.log(JSON.parse(json_object));
        fechImport(JSON.parse(json_object));
        document.getElementById('importar').value = '';
      })
    };
    reader.onerror = function (ex) {
      console.log(ex);
    };
    reader.readAsBinaryString(file);
  }

  const [paginaActual, setPaginaActual] = useState(0);

  const ARTICULOS_POR_PAGINA = 100;

  const handlePageClick = ({ selected: selectedPage }) => {
    setPaginaActual(selectedPage);
  };

  const offset = paginaActual * ARTICULOS_POR_PAGINA;

  const pageCount = Math.ceil(articulos.length / ARTICULOS_POR_PAGINA);

  const filtarProducto = (nombre) => {
    const filtro = nombre.toLowerCase();
    const articulosFiltrados = productos.filter(articulo =>
      articulo.nombre.toLowerCase().includes(filtro) ||
      articulo.codigo.toLowerCase().includes(filtro) ||
      articulo.cantidad.toString().includes(filtro)
    );
    setArticulos(articulosFiltrados);
  };

  const formatDate = (fecha) => {
    const opciones = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    };
    return fecha.toLocaleString('es-ES', opciones);
  }

  useEffect(() => {
    const totalMujeres = parseInt(nuevoCodigo) || 0;
    const totalVarones = parseInt(nuevoModelo) || 0;
    setNuevaCantidad(totalMujeres + totalVarones);
  }, [nuevoCodigo, nuevoModelo]);

  useEffect(() => {
    const totalMujeres = parseInt(codigo) || 0;
    const totalVarones = parseInt(modelo) || 0;
    setCantidad(totalMujeres + totalVarones);
  }, [codigo, modelo]);

  return (
    <>
      <div className="row">
        <div className="col-3">
          <div className="input-group mb-3">
            <input onInput={(e) => filtarProducto(e.target.value)} type="text" className="form-control" placeholder="Buscar" aria-label="Buscar" />
            <button className="btn btn-primary" onClick={getProductos}>
              <i className="fas fa-sync-alt f-18" />
            </button>
          </div>
        </div>

        <div className="page-header">
          <div className="page-block">
            <div className="row align-items-center">
              <div className="col-md-12">
                <ul className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <Link to="/dashboards">
                      Panel
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="row" style={{ height: '80vh' }}>
          {
            cargando ? <><div className="d-flex justify-content-center align-items-center vh-100">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div></> : ''
          }
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <h3 className="card-title">Lista de Registro</h3>
                <div className="text-end p-1">
                  <div className="d-flex justify-content-between" />

                  <button className="btn btn-primary" onClick={getProductos}>
                    <i className="fas fa-sync-alt f-18" />
                  </button>

                  <button className="btn btn-success" data-bs-toggle="modal" data-bs-target="#creararticulo">
                    <i className="fas fa-plus-circle f-18" />
                    Crear Registro
                  </button>

                  <button className="btn btn-secondary" onClick={exportar}>
                    <i className="fas fa-file-export f-18" />
                    Exportar
                  </button>

                  <input
                    type="file"
                    id="importar"
                    className="btn btn-primary"
                    onChange={(e) => importar(e.target.files[0])}
                  />
                </div>

                <div className="table-responsive" style={{ height: '60vh' }}>
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Maestro</th>
                        <th>Seccion</th>
                        <th>Mujeres</th>
                        <th>Varones</th>
                        <th>Cantidad</th>
                        <th>Fecha de Creación</th>
                        <th>Fecha de Modificación</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {
                        articulos.slice(offset, offset + ARTICULOS_POR_PAGINA).map((producto, index) => (
                          <tr key={producto.id}>
                            <th scope="row">{index + 1}</th>
                            <td>{producto.nombre}</td>
                            <td>{producto.descripcion}</td>
                            <td>{producto.codigo}</td>
                            <td>{producto.modelo}</td>
                            <td>{producto.cantidad}</td>
                            <td>{producto.fechaCreacion ? formatDate(producto.fechaCreacion.toDate()) : 'Sin fecha'}</td>
                            <td>{producto.fechaModificacion ? formatDate(producto.fechaModificacion.toDate()) : 'Sin fecha'}</td>
                            <td>
                              <button
                                className="btn btn-warning me-2"
                                onClick={() => mostrarProducto(producto)}
                                data-bs-toggle="modal"
                                data-bs-target="#editararticulo"
                              >
                                <i className="fas fa-edit" />
                              </button>
                              <button className="btn btn-danger" onClick={() => fecheliminar(producto.id)}>
                                <i className="fas fa-trash-alt" />
                              </button>
                            </td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                </div>

                <div className="d-flex justify-content-center">
                  <ReactPaginate
                    previousLabel={"← Anterior"}
                    nextLabel={"Siguiente →"}
                    pageCount={pageCount}
                    onPageChange={handlePageClick}
                    containerClassName={"pagination"}
                    previousLinkClassName={"page-link"}
                    nextLinkClassName={"page-link"}
                    disabledClassName={"disabled"}
                    activeClassName={"active"}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className="modal fade"
          id="creararticulo"
          tabIndex="-1"
          aria-labelledby="creararticuloLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog">
            <form onSubmit={crearArticulo}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="creararticuloLabel">
                    Crear Registro
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="nombre" className="form-label">
                    Maestro
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="nombre"
                      value={nuevoNombre}
                      onChange={(e) => setNuevoNombre(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="descripcion" className="form-label">
                      Seccion
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="descripcion"
                      value={nuevaDescripcion}
                      onChange={(e) => setNuevaDescripcion(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="mujeres" className="form-label">
                      Mujeres
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="mujeres"
                      value={nuevoCodigo}
                      onChange={(e) => setNuevoCodigo(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="varones" className="form-label">
                      Varones
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="varones"
                      value={nuevoModelo}
                      onChange={(e) => setNuevoModelo(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="cantidadTotal" className="form-label">
                      Cantidad Total
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="cantidadTotal"
                      value={nuevaCantidad}
                      readOnly
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    data-bs-dismiss="modal"
                  >
                    Cerrar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Guardar
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div
          className="modal fade"
          id="editararticulo"
          tabIndex="-1"
          aria-labelledby="editararticuloLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog">
            <form onSubmit={ActualizarProducto}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="editararticuloLabel">
                    Editar Articulo
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="nombre" className="form-label">
                      Maestro
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="nombre"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="descripcion" className="form-label">
                      Seccion
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="descripcion"
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="mujeres" className="form-label">
                      Mujeres
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="mujeres"
                      value={codigo}
                      onChange={(e) => setCodigo(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="varones" className="form-label">
                      Varones
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="varones"
                      value={modelo}
                      onChange={(e) => setModelo(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="cantidadTotal" className="form-label">
                      Cantidad Total
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="cantidadTotal"
                      value={cantidad}
                      readOnly
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    data-bs-dismiss="modal"
                  >
                    Cerrar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Guardar
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default Registro
