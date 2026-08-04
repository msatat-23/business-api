import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('contacts')
export class Contact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150 })
  fullName: string;

  @Column({ type: 'varchar', length: 30 })
  phone: string;

  @Column({ type: 'varchar', length: 150 })
  jobTitle: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  // Set when the submitter was authenticated at submission time; null for
  // anonymous submissions. The form itself never requires sign-in.
  @Column({ type: 'uuid', nullable: true })
  submittedByUserId: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
