import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
@Index(['email'], { unique: true })
@Index(['verification_token'], { where: '"verification_token" IS NOT NULL' })
@Index(['password_reset_token'], {
  where: '"password_reset_token" IS NOT NULL',
})
@Index(['refresh_token'], { where: '"refresh_token" IS NOT NULL' })
@Index(['auth_provider', 'provider_id'], {
  where: '"auth_provider" IS NOT NULL AND "provider_id" IS NOT NULL',
})
export class Users {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ length: 255, nullable: true })
  password: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ length: 512, nullable: true })
  avatar_url: string;

  @Column({ type: 'integer', nullable: true })
  age: number;

  @Column({ length: 50, nullable: true })
  gender: string;

  @Column({ default: false })
  is_verified: boolean;

  @Column({ default: false })
  is_active: boolean;

  @Column({
    length: 64,
    nullable: true,
    comment: 'Secure verification token for email verification',
  })
  verification_token: string;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    comment: 'Expiration time for verification token',
  })
  verification_token_expires_at: Date;

  @Column({
    length: 64,
    nullable: true,
    comment: 'Secure password reset token',
  })
  password_reset_token: string;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    comment: 'Expiration time for password reset token',
  })
  reset_token_expires_at: Date;

  @Column({
    length: 64,
    nullable: true,
    comment: 'Secure refresh token for JWT refresh',
  })
  refresh_token: string;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    comment: 'Expiration time for refresh token',
  })
  refresh_token_expires_at: Date;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    comment: 'Last successful login timestamp',
  })
  last_login_at: Date;

  @Column({
    length: 50,
    nullable: true,
    comment: 'Authentication provider (google, facebook, etc.)',
  })
  auth_provider: string;

  @Column({
    length: 255,
    nullable: true,
    comment: 'Provider-specific user ID',
  })
  provider_id: string;

  @Column({ default: false })
  is_admin: boolean;

  @CreateDateColumn({
    type: 'timestamp with time zone',
    comment: 'User creation timestamp',
  })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp with time zone',
    comment: 'Last update timestamp',
  })
  updated_at: Date;
}
