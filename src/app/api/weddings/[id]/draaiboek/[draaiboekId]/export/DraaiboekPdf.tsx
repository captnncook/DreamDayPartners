import { Document, Page, Text, View, Image, StyleSheet, Font } from "@react-pdf/renderer";
import path from "path";

const LOGO_PATH = path.join(process.cwd(), "public", "logo.png");

const INK = "#1C2B24";
const GOLD = "#C9A75D";
const GOLD_DEEP = "#a8863d";
const CREAM = "#FFFDF7";
const MUTED = "#4A5560";
const BORDER = "#E4DFD6";

Font.registerHyphenationCallback((word) => [word]);

const styles = StyleSheet.create({
  page: {
    backgroundColor: CREAM,
    color: INK,
    fontFamily: "Helvetica",
    paddingTop: 0,
    paddingBottom: 48,
    paddingHorizontal: 0,
  },
  header: {
    backgroundColor: INK,
    paddingHorizontal: 40,
    paddingTop: 32,
    paddingBottom: 24,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  logoBadge: {
    width: 22,
    height: 22,
    borderRadius: 5,
    backgroundColor: "#FFFFFF",
    padding: 3,
    marginRight: 8,
  },
  logoImg: {
    width: "100%",
    height: "100%",
  },
  brand: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: GOLD,
    letterSpacing: 2,
  },
  weddingTitle: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  weddingMeta: {
    fontSize: 10,
    color: "#D8D3C8",
  },
  body: {
    paddingHorizontal: 40,
    paddingTop: 24,
  },
  draaiboekTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 16,
    borderBottomWidth: 1.5,
    borderBottomColor: GOLD,
    paddingBottom: 8,
  },
  draaiboekTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
  },
  draaiboekVersion: {
    fontSize: 9,
    color: MUTED,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    paddingVertical: 9,
    alignItems: "flex-start",
  },
  colTime: {
    width: 78,
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: GOLD_DEEP,
  },
  colMain: {
    flex: 1,
    paddingRight: 8,
  },
  itemTitle: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },
  itemSub: {
    fontSize: 8.5,
    color: MUTED,
    marginBottom: 1,
  },
  emptyState: {
    fontSize: 10,
    color: MUTED,
    textAlign: "center",
    paddingVertical: 32,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: MUTED,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 8,
  },
});

function toMin(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function endTime(start: string, duration: number): string {
  const total = toMin(start) + duration;
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("nl-NL", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));
}

export type PdfItem = {
  startTime: string;
  duration: number;
  title: string;
  location: string | null;
  notes: string | null;
  vendorName: string | null;
  vendorCategory: string | null;
};

export function DraaiboekPdf({
  weddingTitle,
  weddingDate,
  venue,
  draaiboekTitle,
  version,
  items,
}: {
  weddingTitle: string;
  weddingDate: string;
  venue: string | null;
  draaiboekTitle: string;
  version: string;
  items: PdfItem[];
}) {
  return (
    <Document title={`Draaiboek ${weddingTitle}`}>
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.header} fixed>
          <View style={styles.brandRow}>
            <View style={styles.logoBadge}>
              <Image src={LOGO_PATH} style={styles.logoImg} />
            </View>
            <Text style={styles.brand}>DREAMDAY PLATFORM</Text>
          </View>
          <Text style={styles.weddingTitle}>{weddingTitle}</Text>
          <Text style={styles.weddingMeta}>
            {formatDate(weddingDate)}{venue ? `  ·  ${venue}` : ""}
          </Text>
        </View>

        <View style={styles.body}>
          <View style={styles.draaiboekTitleRow}>
            <Text style={styles.draaiboekTitle}>{draaiboekTitle}</Text>
            <Text style={styles.draaiboekVersion}>versie {version}</Text>
          </View>

          {items.length === 0 ? (
            <Text style={styles.emptyState}>Dit draaiboek bevat nog geen onderdelen.</Text>
          ) : (
            items.map((item, i) => (
              <View key={i} style={styles.row} wrap={false}>
                <Text style={styles.colTime}>
                  {item.startTime} - {endTime(item.startTime, item.duration)}
                </Text>
                <View style={styles.colMain}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  {item.location && <Text style={styles.itemSub}>Locatie: {item.location}</Text>}
                  {item.vendorName && (
                    <Text style={styles.itemSub}>
                      Leverancier: {item.vendorName}{item.vendorCategory ? ` (${item.vendorCategory})` : ""}
                    </Text>
                  )}
                  {item.notes && <Text style={styles.itemSub}>{item.notes}</Text>}
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.footer} fixed>
          <Text>Gegenereerd door DreamDay Platform</Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
