import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Profile } from './profile';

@Entity('organisation')
export class Organisation {

    @PrimaryGeneratedColumn('uuid', { name: 'organisationid' })
    organisationId: string;

    @Column('text', { name: 'name', nullable: false })
    @Index()
    name: string;

    @CreateDateColumn({ name: 'datetime', type: 'timestamp without time zone' })
    datetime: Date;

    @OneToMany(type => Profile, profile => profile.organisation, { eager: false })
    profile: Profile[];

}
