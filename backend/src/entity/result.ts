import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ResultType } from '../component/type';
import { Profile } from './profile';

@Entity('result')
export class Result {

    @PrimaryGeneratedColumn('uuid', { name: 'resultid' })
    resultId: string;

    @CreateDateColumn({ name: 'activationtime', type: 'timestamp without time zone' })
    activateTime: Date;

    @Column('text', { name: 'activatedby',  nullable: true })
    activatedBy?: string;

    @Column('text', { name: 'sampleid', nullable: false })
    @Index()
    sampleId: string;

    @UpdateDateColumn({ name: 'resultTime', type: 'timestamp without time zone' })
    resultTime: Date;

    @Column('text', { name: 'result', nullable: true })
    result: string;

    @ManyToOne(type => Profile, profile => profile.result)
    profile: Profile;

    @Column('text', { name: 'type', nullable: false, default: ResultType.rtpcr, })
    type: ResultType;

}
