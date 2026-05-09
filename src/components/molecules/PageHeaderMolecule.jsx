/**
 * Molecule: marketing-style page chrome (atoms + themed layout slots).
 */
import { appStyles as sx } from "../../styles/createAppStyles.js";

export function PageHeaderMolecule({ title, sub }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h1 style={sx.pageTitle}>{title}</h1>
      {sub && <p style={sx.pageSub}>{sub}</p>}
    </div>
  );
}
