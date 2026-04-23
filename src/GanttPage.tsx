import React, { useState, useEffect } from "react";
import { Task, ViewMode, Gantt } from "gantt-task-react"; 
import { InputGroup, FormControl } from 'react-bootstrap';

// Ajustamos las rutas asumiendo que view-switcher y el CSS están en /components
import { ViewSwitcher } from "./components/view-switcher"; 
import { getStartEndDateForProject } from "./helper"; 

import "gantt-task-react/dist/index.css";
import './components/ProyectosPage.css'; // <-- Ruta corregida para buscar el CSS en components

interface GanttPageProps {
  cambiarVista: (vista: string) => void;
}

const GanttPage: React.FC<GanttPageProps> = ({ cambiarVista }) => {
  const [view, setView] = useState<ViewMode>(ViewMode.Day);
  const [tasks, setTasks] = useState<Task[]>([]); 
  const [isChecked, setIsChecked] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch("http://localhost:5114/api/Gantt/GetTasks")
      .then((response) => {
        if (!response.ok) throw new Error("Error en la red");
        return response.json();
      })
      .then((data) => {
        const formattedTasks: Task[] = data.map((item: any) => ({
          ...item,
          start: new Date(item.start), 
          end: new Date(item.end),
          hideChildren: item.hideChildren ?? false,
        }));
        setTasks(formattedTasks);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Hubo un error cargando las tareas:", error);
        setIsLoading(false);
      });
  }, []);

  let columnWidth = 65;
  if (view === ViewMode.Year) {
    columnWidth = 350;
  } else if (view === ViewMode.Month) {
    columnWidth = 300;
  } else if (view === ViewMode.Week) {
    columnWidth = 250;
  }

  const handleTaskChange = (task: Task) => {
    console.log("On date change Id:" + task.id);
    let newTasks = tasks.map((t) => (t.id === task.id ? task : t));
    if (task.project) {
      const [start, end] = getStartEndDateForProject(newTasks, task.project);
      const projectIndex = newTasks.findIndex((t) => t.id === task.project);
      if (projectIndex !== -1) {
        const project = newTasks[projectIndex];
        if (
          project.start.getTime() !== start.getTime() ||
          project.end.getTime() !== end.getTime()
        ) {
          const changedProject = { ...project, start, end };
          newTasks = newTasks.map((t) =>
            t.id === task.project ? changedProject : t
          );
        }
      }
    }
    setTasks(newTasks);
  };

  const handleTaskDelete = (task: Task) => {
    const conf = window.confirm("Are you sure about " + task.name + " ?");
    if (conf) {
      setTasks(tasks.filter((t) => t.id !== task.id));
    }
    return conf;
  };

  const handleProgressChange = async (task: Task) => {
    setTasks(tasks.map((t) => (t.id === task.id ? task : t)));
    console.log("On progress change Id:" + task.id);
  };

  const handleDblClick = (task: Task) => {
    alert("On Double Click event Id:" + task.id);
  };

  const handleClick = (task: Task) => {
    console.log("On Click event Id:" + task.id);
  };

  const handleSelect = (task: Task, isSelected: boolean) => {
    console.log(task.name + " has " + (isSelected ? "selected" : "unselected"));
  };

  const handleExpanderClick = (task: Task) => {
    setTasks(tasks.map((t) => (t.id === task.id ? task : t)));
    console.log("On expander click Id:" + task.id);
  };

  return (
    <div className="wrapper">
      <header className="header-container mb-4">
        <div className="header-left">
            <h1 className="header-title">Cronograma <span className="text-success">Gantt</span></h1>
            <div className="d-flex align-items-center mt-2">
                <ViewSwitcher
                    onViewModeChange={(viewMode: ViewMode) => setView(viewMode)}
                    onViewListChange={setIsChecked}
                    isChecked={isChecked}
                />
                <InputGroup className="ms-3 search-input">
                    <InputGroup.Text><i className="fa fa-search"></i></InputGroup.Text>
                    <FormControl placeholder="Buscar tarea..." />
                </InputGroup>
            </div>
        </div>
        <div className="header-right">
            <div className="top-tabs mb-2">
                <span onClick={() => cambiarVista('proyectos')}>Proyectos</span>
                <span onClick={() => cambiarVista('subproyectos')}>Subproyectos</span>
                <span onClick={() => cambiarVista('boms')}>BOMs</span>
                <span className="active-tab">Gantt</span>
            </div>
        </div>
      </header>

      <main className="main-content">
        {isLoading ? (
            <div style={{ textAlign: "center", padding: "50px" }}>
                <h4 className="text-muted">Cargando cronograma...</h4>
            </div>
        ) : tasks.length === 0 ? (
            <div style={{ textAlign: "center", padding: "50px" }}>
                <h4 className="text-muted">No hay tareas registradas.</h4>
            </div>
        ) : (
            <div style={{ overflowX: 'auto', width: '100%' }}>
                <Gantt
                    tasks={tasks}
                    viewMode={view}
                    onDateChange={handleTaskChange}
                    onDelete={handleTaskDelete}
                    onProgressChange={handleProgressChange}
                    onDoubleClick={handleDblClick}
                    onClick={handleClick}
                    onSelect={handleSelect}
                    onExpanderClick={handleExpanderClick}
                    listCellWidth={isChecked ? "155px" : ""}
                    columnWidth={columnWidth}
                />
            </div>
        )}
      </main>
    </div>
  );
};

export default GanttPage;