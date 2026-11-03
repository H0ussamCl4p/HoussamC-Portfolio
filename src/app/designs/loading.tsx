import { Column, Row } from "@once-ui-system/core";
import styles from "@/components/designs/DesignsView.module.scss";

// Shown while the Drive listing is fetched on the server (uncached requests only).
export default function DesignsLoading() {
  return (
    <Column maxWidth="l" fillWidth gap="24" aria-busy="true" aria-label="Loading designs">
      <div className={styles.skeleton} style={{ width: 180, height: 36 }} />
      <div className={styles.skeleton} style={{ width: "60%", height: 18 }} />
      <Row gap="16" fillWidth s={{ direction: "column" }}>
        {[0, 1, 2].map((i) => (
          <div key={i} className={styles.skeleton} style={{ flex: 1, height: 260 }} />
        ))}
      </Row>
    </Column>
  );
}
