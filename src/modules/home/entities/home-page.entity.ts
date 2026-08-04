import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

/**
 * The home page is modeled as a SINGLETON row (id is always 1).
 * Each column stores one section of the marketing site content as JSONB,
 * mirroring the shape of the original Next.js /data/*.json files
 * (site.json, heroSection.json, services.json, ...). This lets an
 * editor/admin update the whole home page (or any subset of sections)
 * through a single PATCH /home request while keeping each section
 * independently queryable/indexable in Postgres.
 */
@Entity('home_page')
export class HomePage {
  @PrimaryColumn({ type: 'int', default: 1 })
  id: number;

  @Column({ type: 'jsonb', nullable: true })
  site: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  heroSection: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  heroDashboard: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  chartData: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  navigation: any[];

  @Column({ type: 'jsonb', nullable: true })
  services: any[];

  @Column({ type: 'jsonb', nullable: true })
  capabilities: any[];

  @Column({ type: 'jsonb', nullable: true })
  methodology: any[];

  @Column({ type: 'jsonb', nullable: true })
  roadmap: any[];

  @Column({ type: 'jsonb', nullable: true })
  portfolio: any[];

  @Column({ type: 'jsonb', nullable: true })
  sectorPlaybooks: any[];

  @Column({ type: 'varchar', nullable: true })
  updatedByEmail: string | null;

  @UpdateDateColumn()
  updatedAt: Date;
}
