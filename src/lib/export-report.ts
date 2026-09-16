import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";

/**
 * Filtra elementos que não devem aparecer na exportação
 */
const filterElements = (node: HTMLElement) => {
  return node.getAttribute?.("data-export-ignore") !== "true";
};

export const exportNodeAsPNG = async (node: HTMLElement, fileName: string): Promise<void> => {
  try {
    const dataUrl = await toPng(node, {
      quality: 1.0,
      pixelRatio: 2,
      filter: filterElements,
      // FORÇA A CAPTURA DO TAMANHO TOTAL DO ELEMENTO (MESMO COM ROLAGEM)
      width: node.scrollWidth,
      height: node.scrollHeight,
      style: {
        transform: "none",
        margin: "0",
      },
    });

    const link = document.createElement("a");
    link.download = `${fileName}.png`;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error("Erro ao gerar PNG:", error);
    throw new Error("Falha na geração da imagem");
  }
};

export const exportNodeAsPDF = async (node: HTMLElement, fileName: string): Promise<void> => {
  try {
    const dataUrl = await toPng(node, {
      quality: 1.0,
      pixelRatio: 2,
      filter: filterElements,
      // FORÇA A CAPTURA DO TAMANHO TOTAL DO ELEMENTO (MESMO COM ROLAGEM)
      width: node.scrollWidth,
      height: node.scrollHeight,
      style: {
        transform: "none",
        margin: "0",
      },
    });

    // Cria um PDF com o tamanho DINÂMICO (exatamente do tamanho do relatório)
    // Assim não corta e nem espreme o conteúdo.
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [node.scrollWidth, node.scrollHeight],
    });

    pdf.addImage(dataUrl, "PNG", 0, 0, node.scrollWidth, node.scrollHeight);
    pdf.save(`${fileName}.pdf`);
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    throw new Error("Falha na geração do PDF");
  }
};
