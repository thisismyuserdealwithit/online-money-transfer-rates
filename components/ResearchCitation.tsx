import { getResearchCitation, researchCitationUpdated, researchDatasetSchema, type ResearchStudyId } from "@/lib/research-citations";
import styles from "./ResearchCitation.module.css";

function dateLabel(date: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));
}

export function ResearchCitation({ studyId }: { studyId: ResearchStudyId }) {
  const study = getResearchCitation(studyId);
  return (
    <section className={styles.citation} id="cite-this-study" aria-labelledby="research-citation-title">
      <span className="kicker">CITATION, DATA AND REUSE</span>
      <h2 id="research-citation-title">Cite this study and its data</h2>
      <p className={styles.intro}>Use the canonical report for the analysis and the versioned files to cite or reuse its published tables. Reproducing the full service-level analysis also requires the original World Bank data and the methodology. The dates below separate publication, the archived snapshot and the periods actually observed.</p>

      <div className={styles.reference}>
        <h3>Report reference</h3>
        <p>Online Money Transfer. <cite>{study.title}</cite>. Published by Finofin Limited, {dateLabel(study.reportPublished)}. Research and editorial authors: Alon Rajic and Russell Gous.</p>
        <p className={styles.canonical}><a href={study.canonicalUrl}>{study.canonicalUrl}</a></p>
        <p className={styles.small}>Report text updated <time dateTime={researchCitationUpdated}>{dateLabel(researchCitationUpdated)}</time>. This does not change the observation dates or the archived data edition.</p>
        <h3>Data release citation</h3>
        <p>{study.suggestedCitation} <a href={study.releaseUrl}>Versioned release record</a>.</p>
      </div>

      <dl className={styles.facts}>
        <div><dt>Edition and snapshot</dt><dd>Version {study.version}; snapshot <time dateTime={study.snapshotDate}>{dateLabel(study.snapshotDate)}</time>. Posted on GitHub <time dateTime={study.releasePublished}>{dateLabel(study.releasePublished)}</time>.</dd></div>
        <div><dt>Observation periods</dt><dd>{study.observations}</dd></div>
        <div><dt>Transfer amounts</dt><dd>{study.transferBasis}</dd></div>
        <div><dt>What the results support</dt><dd>{study.limits}</dd></div>
      </dl>

      <div className={styles.files}>
        <h3 id="dataset-v1-0-0">Version {study.version} data files</h3>
        <p>{study.description}</p>
        <ul>{study.files.map((file) => <li key={file.file}><a href={file.url}>{file.label}</a><span>CSV · {file.rows} rows</span></li>)}</ul>
        <p className={styles.small}>These are derived tables. The <a href={study.sources[0]}>original World Bank RPW dataset</a> supplies the source service records. File links are fixed to the published release commit.</p>
      </div>

      <nav className={styles.resources} aria-label="Research citation and verification files">
        <a href={study.archiveUrl}>Complete release ZIP</a>
        <a href={study.citationUrl}>CITATION.cff</a>
        <a href={study.checksumUrl}>SHA-256 checksums</a>
        <a href="#method">Report methodology</a>
        <a href={study.methodologyUrl}>Archived methodology</a>
        <a href={study.licenceUrl}>Release licence</a>
        <a href={study.attributionUrl}>Rights and source attribution</a>
      </nav>

      <div className={styles.reuse}>
        <h3>Reuse with the source credits and limits intact</h3>
        <p>Finofin licenses its original selection, arrangement, calculations and documentation under <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>. Underlying World Bank data retain their licence and additional terms. Cite the release and the World Bank inputs; preserve periods, units, missing values and qualifications. No endorsement by the World Bank or a named provider is implied.</p>
        <p>{study.reuseLimits}</p>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(researchDatasetSchema(studyId)).replace(/</g, "\\u003c") }} />
    </section>
  );
}