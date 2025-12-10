export function escapeHtml(s = "") {
  return String(s).replace(/[&<>"']/g, (m) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]!)
  );
}

export function renderList(subjects: any[], currentUser: any, enrollments: any[]) {
  const container = document.querySelector("#subject-list")!;
  container.innerHTML = "";

  if (!subjects.length) {
    container.innerHTML = `
      <div class="col-12">
        <div class="alert alert-info">Nenhuma matéria cadastrada ainda.</div>
      </div>`;
    return;
  }

  for (const subject of subjects) {
    const enrollment = enrollments.find((e: any) => e.materiaId === subject.id);
    const col = document.createElement("div");

    col.className = "col-md-4 mb-3";

    col.innerHTML = `
      <div class="card h-100">
        <div class="card-body">

          <h5 class="card-title">${escapeHtml(subject.nome)}</h5>
          <p class="card-text">${escapeHtml(subject.descricao ?? "")}</p>
          <p class="small text-muted">Professor: ${escapeHtml(subject.professor?.nome ?? "—")}</p>
        
          ${enrollment ? `<button class="btn btn-sm btn-outline-primary me-2" data-edit="${subject.id}-details">Detalhes</button>` : ""}
          ${getEnrollButton(subject.id, currentUser, enrollment)}
        </div>
      </div>
    `;

    container.appendChild(col);
  }
}

function getEnrollButton(subjectId: number, user: any, enrollment: any) {
  if (!user)
    return `<button class="btn btn-sm btn-secondary" disabled>Login para matricular</button>`;

  if (enrollment)
    return `<button class="btn btn-sm btn-danger" data-unenroll="${enrollment.id}">
      Desmatricular
    </button>`;

  return `<button class="btn btn-sm btn-success" data-enroll="${subjectId}">
    Matricular
  </button>`;
}

